"""Create the initial administrator without printing or hardcoding credentials."""

import json
import secrets
from pathlib import Path

from dotenv import dotenv_values, set_key

from backend.app.core.auth import hash_password


def initialize_admin(env_path: Path, credentials_path: Path, username="administrador"):
    if not env_path.is_file():
        raise ValueError("Configure primero la conexión a la base de datos en .env")
    if (
        not username
        or username != username.strip()
        or len(username) > 100
        or any(ord(c) < 32 for c in username)
    ):
        raise ValueError("El nombre de usuario no es válido")
    settings = dotenv_values(env_path)
    users = json.loads(settings.get("AUTH_USERS") or "{}")
    if not isinstance(users, dict):
        raise TypeError("AUTH_USERS debe ser un objeto JSON")
    if any(user.get("role") == "administrador" for user in users.values()):
        raise ValueError(
            "Ya existe una cuenta administradora; no se modificó el acceso"
        )
    if username in users:
        raise ValueError("Ese usuario ya existe; elija otro nombre")
    password = secrets.token_urlsafe(24)
    users[username] = {
        "password_hash": hash_password(password),
        "role": "administrador",
    }
    secret = settings.get("SESSION_SECRET") or ""
    if len(secret) < 32:
        secret = secrets.token_urlsafe(48)
    # Exclusive creation prevents overwriting an existing credentials handoff.
    with credentials_path.open("x", encoding="utf-8") as handoff:
        handoff.write(
            "Acceso inicial a Laboratorio Talca\n\n"
            "Página: http://127.0.0.1:8000/administracion\n"
            f"Usuario: {username}\nContraseña: {password}\n"
        )
    set_key(env_path, "SESSION_SECRET", secret)
    set_key(env_path, "AUTH_USERS", json.dumps(users, ensure_ascii=True))
    return username


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[3]
    handoff_path = root / ".acceso-administrador.txt"
    try:
        name = initialize_admin(root / ".env", handoff_path)
    except (ValueError, TypeError, OSError) as exc:
        raise SystemExit(str(exc)) from exc
    print(f"Cuenta {name} creada. Credenciales guardadas en {handoff_path.name}.")
    print("Reinicie el servidor para activar el acceso.")
