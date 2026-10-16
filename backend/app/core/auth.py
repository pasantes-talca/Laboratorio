"""Server-owned identities and signed, HttpOnly browser sessions."""

import base64
import hashlib
import hmac
import json
import re
import secrets
import time

from backend.app.core.config import AUTH_USERS, ENVIRONMENT, SESSION_SECONDS, SESSION_SECRET

COOKIE_NAME = "laboratorio_session"
ROLES = {"operador", "supervisor", "administrador"}


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 600_000).hex()
    return f"pbkdf2_sha256$600000${salt}${digest}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        scheme, iterations, salt, expected = encoded.split("$")
        if scheme != "pbkdf2_sha256" or not 100_000 <= int(iterations) <= 2_000_000:
            return False
        actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), int(iterations)).hex()
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


def valid_password_hash(encoded: str) -> bool:
    if not isinstance(encoded, str):
        return False
    match = re.fullmatch(r"pbkdf2_sha256\$(\d+)\$[a-f0-9]{32}\$[a-f0-9]{64}", encoded)
    return bool(match and 100_000 <= int(match[1]) <= 2_000_000)


def users() -> dict:
    return json.loads(AUTH_USERS)


def enabled() -> bool:
    return bool(users())


def validate_auth_config():
    configured = users()
    if not isinstance(configured, dict):
        raise ValueError("AUTH_USERS debe ser un objeto JSON")
    if ENVIRONMENT != "development" and not configured:
        raise ValueError("Configure AUTH_USERS antes de iniciar fuera de desarrollo")
    if configured and len(SESSION_SECRET) < 32:
        raise ValueError("SESSION_SECRET debe tener al menos 32 caracteres")
    for username, user in configured.items():
        if not isinstance(user, dict) or user.get("role") not in ROLES:
            raise ValueError("Cada usuario requiere un rol válido")
        encoded = user.get("password_hash", "")
        if (
            not username or username != username.strip() or len(username) > 100
            or any(ord(character) < 32 for character in username)
            or not valid_password_hash(encoded)
        ):
            raise ValueError("Cada usuario requiere un nombre y un hash PBKDF2")


def issue_session(username: str) -> str:
    fingerprint = hashlib.sha256(users()[username]["password_hash"].encode()).hexdigest()
    payload = json.dumps({
        "sub": username, "exp": int(time.time()) + SESSION_SECONDS,
        "credential": fingerprint, "nonce": secrets.token_hex(16),
    }, separators=(",", ":")).encode()
    encoded = base64.urlsafe_b64encode(payload).decode().rstrip("=")
    signature = hmac.new(SESSION_SECRET.encode(), encoded.encode(), hashlib.sha256).hexdigest()
    return f"{encoded}.{signature}"


def read_session(token: str | None) -> dict | None:
    if not token or not SESSION_SECRET:
        return None
    try:
        encoded, signature = token.rsplit(".", 1)
        expected = hmac.new(SESSION_SECRET.encode(), encoded.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(signature, expected):
            return None
        payload = json.loads(base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4)))
        user = users().get(payload["sub"])
        if not user or payload["exp"] <= time.time():
            return None
        fingerprint = hashlib.sha256(user["password_hash"].encode()).hexdigest()
        if not hmac.compare_digest(payload["credential"], fingerprint):
            return None
        return {"username": payload["sub"], "role": user["role"]}
    except (ValueError, KeyError, TypeError):
        return None


if __name__ == "__main__":
    from getpass import getpass

    password = getpass("Contraseña nueva (mínimo 12 caracteres): ")
    if len(password) < 12:
        raise SystemExit("Use al menos 12 caracteres")
    print(hash_password(password))
