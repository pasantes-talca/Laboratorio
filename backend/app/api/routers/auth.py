import time
from collections import OrderedDict
from threading import Lock

from fastapi import APIRouter, HTTPException, Request, Response
from pydantic import BaseModel, Field

from backend.app.core import auth
from backend.app.core.config import ENVIRONMENT, SESSION_SECONDS

router = APIRouter(prefix="/api/auth", tags=["Sesión"])
failures: OrderedDict = OrderedDict()
attempt_lock = Lock()
DUMMY_HASH = auth.hash_password("unused-constant-time-verification")


class Login(BaseModel):
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1, max_length=1024)


@router.get("/session")
def session(request: Request, response: Response):
    response.headers["Cache-Control"] = "no-store"
    identity = auth.read_session(request.cookies.get(auth.COOKIE_NAME))
    return {"required": auth.enabled(), "user": identity}


@router.post("/login")
def login(data: Login, request: Request, response: Response):
    if not auth.enabled():
        raise HTTPException(status_code=400, detail="El acceso local no requiere sesión")
    username = data.username.strip()
    key = (request.client.host if request.client else "unknown", username)
    with attempt_lock:
        now = time.monotonic()
        count, started = failures.get(key, (0, now))
        if now - started >= 60:
            count, started = 0, now
        if count >= 5:
            raise HTTPException(status_code=429, detail="Espere un minuto antes de volver a intentar")
        # Reserve the attempt before hashing so concurrent requests cannot bypass the limit.
        failures[key] = (count + 1, started)
        failures.move_to_end(key)
        if len(failures) > 1024:
            failures.popitem(last=False)
    user = auth.users().get(username)
    valid = auth.verify_password(data.password, user["password_hash"] if user else DUMMY_HASH)
    if not user or not valid:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    with attempt_lock:
        failures.pop(key, None)
    response.set_cookie(
        auth.COOKIE_NAME, auth.issue_session(username), max_age=SESSION_SECONDS,
        httponly=True, secure=ENVIRONMENT != "development", samesite="strict", path="/api",
    )
    response.headers["Cache-Control"] = "no-store"
    return {"username": username, "role": user["role"]}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(auth.COOKIE_NAME, path="/api", secure=ENVIRONMENT != "development", httponly=True, samesite="strict")
    response.headers["Cache-Control"] = "no-store"
    return {"message": "Sesión cerrada"}
