"""Authenticate API requests and authorize writes using server-owned roles."""

import logging
from uuid import uuid4

from fastapi import Request
from fastapi.responses import JSONResponse

from backend.app.core import auth
from backend.app.core.config import ALLOWED_ORIGINS

AUDIT_LOG = logging.getLogger("laboratorio.audit")
WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
DELETE_ROLES = {"supervisor", "administrador"}


async def security_and_audit_middleware(request: Request, call_next):
    request_id = str(uuid4())
    request.state.request_id = request_id
    secured = auth.enabled()
    identity = (
        auth.read_session(request.cookies.get(auth.COOKIE_NAME)) if secured else None
    )
    actor = identity["username"] if identity else None
    role = identity["role"] if identity else ("sin-sesion" if secured else "operador")
    request.state.actor = actor
    request.state.role = role
    path = request.url.path
    is_api = path == "/api" or path.startswith("/api/")

    def reject(status, detail):
        return JSONResponse(
            status_code=status,
            content={"detail": detail, "request_id": request_id},
            headers={"X-Request-ID": request_id},
        )

    if is_api and request.method != "OPTIONS":
        if request.method in WRITE_METHODS:
            origin = request.headers.get("origin")
            if (
                origin
                and origin != str(request.base_url).rstrip("/")
                and origin not in ALLOWED_ORIGINS
            ):
                return reject(403, "Origen no autorizado")
        admin_path = path == "/api/admin" or path.startswith("/api/admin/")
        # Selecting the active production is part of the public form workflow.
        production_setup = path in {
            "/api/calidad/produccion/1",
            "/api/calidad/produccion/2",
        }
        restricted = (
            admin_path
            or request.method in {"PATCH", "DELETE"}
            or (request.method == "PUT" and not production_setup)
        )
        if secured and restricted:
            if not identity:
                return reject(401, "Inicie sesión para administrar los registros")
            if (
                admin_path or request.method in {"PATCH", "PUT"}
            ) and role != "administrador":
                return reject(403, "Esta operación requiere permisos de administrador")
            if request.method == "DELETE" and role not in DELETE_ROLES:
                return reject(403, "El rol no esta autorizado para esta operacion")
        if not secured and request.method == "DELETE":
            return reject(
                403, "Configure un usuario supervisor para eliminar registros"
            )

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    if is_api and request.method in WRITE_METHODS:
        AUDIT_LOG.info(
            "request_id=%s actor=%s role=%s method=%s path=%s status=%s",
            request_id,
            actor or "sin-sesion",
            role,
            request.method,
            path,
            response.status_code,
        )
    return response
