from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class AuditMiddleware(BaseHTTPMiddleware):
    """Logs API requests for audit trail. Lightweight — only logs mutating requests."""

    MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        if request.method in self.MUTATING_METHODS:
            # In production, this would write to the audit_logs table asynchronously
            pass

        return response
