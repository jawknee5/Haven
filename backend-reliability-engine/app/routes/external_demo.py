"""
Demo resilience patterns
Shows circuit breaker, retries, timeouts
"""

from fastapi import APIRouter, Request
import asyncio
from app.resilience import CircuitBreaker, RetryPolicy
from app.errors import CircuitBreakerError, ExternalServiceError
from app.logging_utils import get_logger

router = APIRouter()
logger = get_logger()

# Demo circuit breaker
demo_breaker = CircuitBreaker(
    name="demo_external_api",
    failure_threshold=3,
    recovery_timeout=30
)

# Demo retry policy
demo_retry = RetryPolicy(
    max_attempts=3,
    base_delay=0.5,
    max_delay=5.0
)

@router.post("/demo/external-api-call")
async def demo_external_call(request: Request, fail_count: int = 0):
    """
    Demo endpoint showing circuit breaker
    Pass fail_count to simulate failures
    """
    correlation_id = request.state.correlation_id
    
    # Simulated external API that fails N times then succeeds
    call_count = getattr(request.app.state, 'call_count', 0)
    request.app.state.call_count = call_count + 1
    
    async def external_api():
        if request.app.state.call_count <= fail_count:
            raise Exception("API temporarily down")
        return {"data": "success", "call_number": request.app.state.call_count}
    
    try:
        result = await demo_breaker.call(external_api)
        
        logger.info("demo_api_success", extra={
            "correlation_id": correlation_id,
            "result": result
        })
        
        return {
            "status": "success",
            "result": result,
            "correlation_id": correlation_id
        }
    except CircuitBreakerError as e:
        logger.warning("demo_circuit_breaker_open", extra={
            "correlation_id": correlation_id,
            "message": str(e)
        })
        return {
            "status": "circuit_breaker_open",
            "message": "Service temporarily unavailable",
            "correlation_id": correlation_id
        }, 503
    except ExternalServiceError as e:
        logger.error("demo_external_error", extra={
            "correlation_id": correlation_id,
            "error": str(e)
        })
        return {
            "status": "error",
            "message": str(e),
            "correlation_id": correlation_id
        }, 502

@router.post("/demo/retry-pattern")
async def demo_retry(request: Request, fail_times: int = 2):
    """
    Demo endpoint showing retry with exponential backoff
    Pass fail_times to simulate failures before success
    """
    correlation_id = request.state.correlation_id
    attempt = [0]
    
    async def flaky_operation():
        attempt[0] += 1
        logger.info("demo_retry_attempt", extra={
            "attempt": attempt[0],
            "correlation_id": correlation_id
        })
        
        if attempt[0] <= fail_times:
            raise Exception(f"Failing on attempt {attempt[0]}")
        
        return {"success": True, "attempts": attempt[0]}
    
    try:
        result = await demo_retry.execute(
            flaky_operation,
            correlation_id=correlation_id
        )
        
        logger.info("demo_retry_success", extra={
            "correlation_id": correlation_id,
            "attempts": result["attempts"]
        })
        
        return {
            "status": "success",
            "result": result,
            "correlation_id": correlation_id
        }
    except Exception as e:
        logger.error("demo_retry_failed", extra={
            "correlation_id": correlation_id,
            "attempts": attempt[0],
            "error": str(e)
        })
        return {
            "status": "failed",
            "message": str(e),
            "attempts": attempt[0],
            "correlation_id": correlation_id
        }, 500

@router.get("/demo/resilience-status")
async def resilience_status(request: Request):
    """
    Show current state of resilience mechanisms
    """
    correlation_id = request.state.correlation_id
    
    return {
        "circuit_breaker": {
            "service": demo_breaker.name,
            "state": demo_breaker.state.value,
            "failure_count": demo_breaker.failure_count,
            "threshold": demo_breaker.failure_threshold
        },
        "retry_policy": {
            "max_attempts": demo_retry.max_attempts,
            "base_delay": demo_retry.base_delay,
            "exponential_base": demo_retry.exponential_base
        },
        "correlation_id": correlation_id
    }
