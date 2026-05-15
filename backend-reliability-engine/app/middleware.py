"""
Middleware for Pathway Backend
Adds correlation IDs, timing, security headers
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uuid
import time
from datetime import datetime

from app.config import settings
from app.logging_utils import get_logger

logger = get_logger()

async def correlation_id_middleware(request: Request, call_next):
    """Add correlation ID to request"""
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    request.state.correlation_id = correlation_id
    request.state.user_id = request.headers.get("X-User-ID", "anonymous")
    request.state.start_time = time.time()
    
    # Log request
    logger.info("request_received", extra={
        "correlation_id": correlation_id,
        "method": request.method,
        "path": request.url.path,
        "user_id": request.state.user_id,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    response = await call_next(request)
    
    # Add correlation ID to response
    response.headers["X-Correlation-ID"] = correlation_id
    
    # Log response
    duration_ms = (time.time() - request.state.start_time) * 1000
    logger.info("request_completed", extra={
        "correlation_id": correlation_id,
        "method": request.method,
        "path": request.url.path,
        "status_code": response.status_code,
        "duration_ms": duration_ms,
        "user_id": request.state.user_id
    })
    
    return response

def add_middleware(app: FastAPI):
    """Add all middleware"""
    
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Trusted hosts
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.CORS_ORIGINS
    )
    
    # Correlation ID & timing
    app.middleware("http")(correlation_id_middleware)
    
    # Security headers
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response
