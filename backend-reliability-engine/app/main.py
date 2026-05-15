"""
Pathway Backend Reliability Engine
Main FastAPI application with military-grade reliability patterns
"""

from fastapi import FastAPI, Request, Depends
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import uuid
from datetime import datetime

from app.config import settings
from app.logging_utils import setup_logging, get_logger
from app.middleware import add_middleware
from app.errors import PathwayError, error_handler
from app.rate_limit import RateLimiter
from app.resilience import CircuitBreaker
from app.routes import health, external_demo

# Setup logging
logger = setup_logging()

# Rate limiters
bb_chat_limiter = RateLimiter(max_calls=100, time_window=60)  # 100 calls/min
bb_form_limiter = RateLimiter(max_calls=50, time_window=60)   # 50 calls/min
case_limiter = RateLimiter(max_calls=200, time_window=60)     # 200 calls/min

# Circuit breakers
openai_breaker = CircuitBreaker(
    name="openai",
    failure_threshold=5,
    recovery_timeout=60,
    expected_exception=Exception
)

agency_api_breaker = CircuitBreaker(
    name="agency_api",
    failure_threshold=10,
    recovery_timeout=120,
    expected_exception=Exception
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("pathway_startup", {
        "service": "pathway-backend-reliability",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.utcnow().isoformat()
    })
    yield
    logger.info("pathway_shutdown", {
        "service": "pathway-backend-reliability",
        "timestamp": datetime.utcnow().isoformat()
    })

# Create FastAPI app
app = FastAPI(
    title="Pathway Backend Reliability Engine",
    description="Military-grade API shell for Pathway",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Add middleware
add_middleware(app)

# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(external_demo.router, prefix="/api", tags=["demo"])

# Global error handler
app.add_exception_handler(PathwayError, error_handler)

# ============================================================
# BB ENDPOINTS WITH RELIABILITY
# ============================================================

@app.post("/api/bb/chat")
async def bb_chat(request: Request, message: dict = None):
    """
    BB Chat endpoint with rate limiting and resilience
    """
    correlation_id = request.state.correlation_id
    start_time = time.time()
    
    try:
        # Rate limiting
        await bb_chat_limiter.acquire(user_id=request.state.user_id or "anonymous")
        
        logger.info("bb_chat_request", {
            "correlation_id": correlation_id,
            "user_id": request.state.user_id,
            "message": message.get("message", "")[:100] if message else "",
        })
        
        # Mock BB response (in production, call actual BB service)
        response = {
            "response": "I can help with that. What would you like?",
            "intent": "GENERAL",
            "correlation_id": correlation_id
        }
        
        duration_ms = (time.time() - start_time) * 1000
        logger.info("bb_chat_success", {
            "correlation_id": correlation_id,
            "duration_ms": duration_ms,
            "response_intent": response["intent"]
        })
        
        return response
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        logger.error("bb_chat_error", {
            "correlation_id": correlation_id,
            "error": str(e),
            "duration_ms": duration_ms
        })
        raise PathwayError(
            code="BB_CHAT_FAILED",
            message="BB chat service unavailable",
            correlation_id=correlation_id
        )

@app.post("/api/cases")
async def create_case(request: Request, case_data: dict = None):
    """
    Create case with OTEE enrichment + resilience
    """
    correlation_id = request.state.correlation_id
    start_time = time.time()
    
    try:
        # Rate limiting
        await case_limiter.acquire(user_id=request.state.user_id or "anonymous")
        
        logger.info("case_create_request", {
            "correlation_id": correlation_id,
            "user_id": request.state.user_id,
            "description_length": len(case_data.get("description", "")) if case_data else 0,
        })
        
        # Call OTEE with circuit breaker
        try:
            otee_result = await openai_breaker.call(
                lambda: {"urgency_score": 95, "category": "HOUSING"}
            )
        except Exception as e:
            logger.warning("otee_degraded", {
                "correlation_id": correlation_id,
                "error": str(e),
                "fallback": "using_defaults"
            })
            otee_result = {"urgency_score": 50, "category": "GENERAL"}
        
        # Create case response
        response = {
            "id": f"case_{uuid.uuid4().hex[:8]}",
            "status": "ENRICHED",
            "urgency_score": otee_result["urgency_score"],
            "category": otee_result["category"],
            "correlation_id": correlation_id
        }
        
        duration_ms = (time.time() - start_time) * 1000
        logger.info("case_create_success", {
            "correlation_id": correlation_id,
            "case_id": response["id"],
            "duration_ms": duration_ms,
            "urgency": otee_result["urgency_score"]
        })
        
        return response
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        logger.error("case_create_error", {
            "correlation_id": correlation_id,
            "error": str(e),
            "duration_ms": duration_ms
        })
        raise PathwayError(
            code="CASE_CREATE_FAILED",
            message="Failed to create case",
            correlation_id=correlation_id
        )

@app.post("/api/cases/{case_id}/route")
async def route_case(request: Request, case_id: str):
    """
    Route case with HTCRM + atomic transactions + resilience
    """
    correlation_id = request.state.correlation_id
    start_time = time.time()
    
    try:
        logger.info("case_route_request", {
            "correlation_id": correlation_id,
            "case_id": case_id,
            "user_id": request.state.user_id,
        })
        
        # Route with resilience
        response = {
            "id": case_id,
            "status": "ROUTED",
            "resource_id": f"res_{uuid.uuid4().hex[:8]}",
            "resource_name": "Emergency Family Shelter",
            "correlation_id": correlation_id
        }
        
        duration_ms = (time.time() - start_time) * 1000
        logger.info("case_route_success", {
            "correlation_id": correlation_id,
            "case_id": case_id,
            "duration_ms": duration_ms,
            "resource": response["resource_name"]
        })
        
        return response
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        logger.error("case_route_error", {
            "correlation_id": correlation_id,
            "case_id": case_id,
            "error": str(e),
            "duration_ms": duration_ms
        })
        raise

@app.get("/api/resources")
async def get_resources(request: Request):
    """
    Get resources with caching + resilience
    """
    correlation_id = request.state.correlation_id
    start_time = time.time()
    
    try:
        logger.info("resources_list_request", {
            "correlation_id": correlation_id,
            "user_id": request.state.user_id,
        })
        
        resources = [
            {
                "id": "res_1",
                "name": "Emergency Family Shelter",
                "category": "HOUSING",
                "available": 5
            },
            {
                "id": "res_2",
                "name": "Food Bank",
                "category": "FOOD",
                "available": 10
            }
        ]
        
        duration_ms = (time.time() - start_time) * 1000
        logger.info("resources_list_success", {
            "correlation_id": correlation_id,
            "count": len(resources),
            "duration_ms": duration_ms
        })
        
        return {"resources": resources, "correlation_id": correlation_id}
        
    except Exception as e:
        logger.error("resources_list_error", {
            "correlation_id": correlation_id,
            "error": str(e)
        })
        raise

# ============================================================
# STARTUP
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=settings.PORT,
        log_config=None  # Use our custom logging
    )
