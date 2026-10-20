import json

import pytest
from dotenv import dotenv_values

from backend.app.core.auth import verify_password
from backend.app.core.bootstrap_admin import initialize_admin


def test_bootstrap_preserves_database_and_stores_only_password_hash_in_env(tmp_path):
    env = tmp_path / ".env"
    handoff = tmp_path / "credentials.txt"
    env.write_text(
        "# Conexión existente\nDB_PASSWORD='existing-database-password'\n",
        encoding="utf-8",
    )
    assert initialize_admin(env, handoff) == "administrador"
    settings = dotenv_values(env)
    user = json.loads(settings["AUTH_USERS"])["administrador"]
    password = handoff.read_text(encoding="utf-8").split("Contraseña: ")[1].strip()
    assert len(password) >= 24
    assert verify_password(password, user["password_hash"])
    assert user["role"] == "administrador"
    assert password not in env.read_text(encoding="utf-8")
    assert settings["DB_PASSWORD"] == "existing-database-password"
    assert len(settings["SESSION_SECRET"]) >= 32
    previous = env.read_bytes()
    with pytest.raises(ValueError, match="Ya existe"):
        initialize_admin(env, handoff)
    assert env.read_bytes() == previous


def test_bootstrap_keeps_other_users_and_valid_session_secret(tmp_path):
    env = tmp_path / ".env"
    users = {"operador": {"role": "operador", "password_hash": "existing-hash"}}
    env.write_text(
        "AUTH_USERS='" + json.dumps(users) + "'\nSESSION_SECRET='" + "s" * 48 + "'\n",
        encoding="utf-8",
    )
    initialize_admin(env, tmp_path / "credentials.txt")
    settings = dotenv_values(env)
    assert json.loads(settings["AUTH_USERS"])["operador"] == users["operador"]
    assert settings["SESSION_SECRET"] == "s" * 48


def test_existing_handoff_is_not_overwritten(tmp_path):
    env = tmp_path / ".env"
    env.write_text("DB_NAME=existing\n", encoding="utf-8")
    handoff = tmp_path / "credentials.txt"
    handoff.write_text("existing", encoding="utf-8")
    with pytest.raises(FileExistsError):
        initialize_admin(env, handoff)
    assert env.read_text(encoding="utf-8") == "DB_NAME=existing\n"
    assert handoff.read_text(encoding="utf-8") == "existing"
