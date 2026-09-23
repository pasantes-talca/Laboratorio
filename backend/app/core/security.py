"""Small deployment-friendly write protection and audit middleware.

When API_KEY is configured, every mutating /api request must provide X-API-Key
and an allowed X-Role. Read-only endpoints remain available to dashboards.
"""

import hmac
import logging
from uuid import uuid4

from fastapi import Request
from fastapi.responses import JSONResponse

from backend.app.core.config import API_KEY

AUDIT_LOG = logging.getLogger("laboratorio.audit")
WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
WRITE_ROLES = {"operador", "supervisor", "administrador"}
DELETE_ROLES = {"supervisor", "administrador"}


async def security_and_audit_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid4())
    request.state.request_id = request_id
    actor = request.headers.get("X-User", "anonimo").strip()[:100] or "anonimo"
    role = request.headers.get("X-Role", "operador").strip().lower()

    if request.url.path.startswith("/api") and request.method in WRITE_METHODS and API_KEY:
        supplied_key = request.headers.get("X-API-Key", "")
        allowed_roles = DELETE_ROLES if request.method == "DELETE" else WRITE_ROLES
        if not hmac.compare_digest(supplied_key, API_KEY):
            return JSONResponse(
                status_code=401,
                content={"detail": "Credencial de API inválida", "request_id": request_id},
                headers={"X-Request-ID": request_id},
            )
        if role not in allowed_roles:
            return JSONResponse(
                status_code=403,
                content={"detail": "El rol no está autorizado para esta operación", "request_id": request_id},
                headers={"X-Request-ID": request_id},
            )

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    if request.url.path.startswith("/api") and request.method in WRITE_METHODS:
        AUDIT_LOG.info(
            "request_id=%s actor=%s role=%s method=%s path=%s status=%s",
            request_id,
            actor,
            role,
            request.method,
            request.url.path,
            response.status_code,
        )
    return response
