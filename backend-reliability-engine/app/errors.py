"""
Error models for Pathway Backend
Unified error handling
"""

from fastapi import Request
from fastapi.responses import JSONResponse
from typing import Optional
from datetime import datetime

class PathwayError(Exception):
    """Base error for Pathway"""
    
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 400,
        correlation_id: Optional[str] = None,
        details: dict = None
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.correlation_id = correlation_id
        self.details = details or {}
        super().__init__(self.message)

class ValidationError(PathwayError):
    """Validation error"""
    def __init__(self, message: str, correlation_id: str = None):
        super().__init__(
            code="VALIDATION_ERROR",
            message=message,
            status_code=422,
            correlation_id=correlation_id
        )

class RateLimitError(PathwayError):
    """Rate limit exceeded"""
    def __init__(self, correlation_id: str = None):
        super().__init__(
            code="RATE_LIMIT_EXCEEDED",
            message="Too many requests. Please try again later.",
            status_code=429,
            correlation_id=correlation_id
        )

class CircuitBreakerError(PathwayError):
    """Circuit breaker open"""
    def __init__(self, service: str, correlation_id: str = None):
        super().__init__(
            code="SERVICE_UNAVAILABLE",
            message=f"{service} service temporarily unavailable",
            status_code=503,
            correlation_id=correlation_id,
            details={"service": service}
        )

class ExternalServiceError(PathwayError):
    """External service call failed"""
    def __init__(self, service: str, correlation_id: str = None):
        super().__init__(
            code="EXTERNAL_SERVICE_ERROR",
            message=f"{service} service error",
            status_code=502,
            correlation_id=correlation_id,
            details={"service": service}
        )

async def error_handler(request: Request, exc: PathwayError):
    """Global error handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "correlation_id": exc.correlation_id or request.state.correlation_id,
                "timestamp": datetime.utcnow().isoformat(),
                "details": exc.details
            }
        }
    )
