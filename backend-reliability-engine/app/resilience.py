"""
Resilience patterns for Pathway Backend
Circuit breaker, retries, timeouts
"""

import asyncio
import time
from enum import Enum
from typing import Callable, Any, Optional
from app.errors import CircuitBreakerError, ExternalServiceError
from app.logging_utils import get_logger

logger = get_logger()

class CircuitState(Enum):
    CLOSED = "closed"        # Normal operation
    OPEN = "open"            # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing if recovered

class CircuitBreaker:
    """Circuit breaker pattern implementation"""
    
    def __init__(
        self,
        name: str,
        failure_threshold: int = 5,
        recovery_timeout: int = 60,
        expected_exception: Exception = Exception
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        
        self.state = CircuitState.CLOSED
        self.failure_count = 0
        self.last_failure_time = None
        self.success_count = 0
    
    async def call(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with circuit breaker protection"""
        
        # Check if should attempt recovery
        if self.state == CircuitState.OPEN:
            if self._should_attempt_reset():
                self.state = CircuitState.HALF_OPEN
                logger.info("circuit_breaker_attempting_reset", extra={
                    "service": self.name
                })
            else:
                raise CircuitBreakerError(self.name)
        
        try:
            result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)
            self._on_success()
            return result
        except self.expected_exception as e:
            self._on_failure()
            raise ExternalServiceError(self.name)
    
    def _on_success(self):
        """Handle successful call"""
        self.failure_count = 0
        self.last_failure_time = None
        
        if self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.CLOSED
            self.success_count = 0
            logger.info("circuit_breaker_recovered", extra={
                "service": self.name
            })
    
    def _on_failure(self):
        """Handle failed call"""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        logger.warning("circuit_breaker_failure", extra={
            "service": self.name,
            "failure_count": self.failure_count,
            "threshold": self.failure_threshold
        })
        
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            logger.error("circuit_breaker_opened", extra={
                "service": self.name,
                "failures": self.failure_count
            })
    
    def _should_attempt_reset(self) -> bool:
        """Check if should attempt recovery"""
        if self.last_failure_time is None:
            return True
        
        elapsed = time.time() - self.last_failure_time
        return elapsed >= self.recovery_timeout

class RetryPolicy:
    """Retry policy with exponential backoff"""
    
    def __init__(
        self,
        max_attempts: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 60.0,
        exponential_base: float = 2.0
    ):
        self.max_attempts = max_attempts
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base
    
    async def execute(
        self,
        func: Callable,
        correlation_id: str = None,
        *args,
        **kwargs
    ) -> Any:
        """Execute function with retry"""
        last_exception = None
        
        for attempt in range(1, self.max_attempts + 1):
            try:
                return await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)
            except Exception as e:
                last_exception = e
                
                if attempt < self.max_attempts:
                    delay = min(
                        self.base_delay * (self.exponential_base ** (attempt - 1)),
                        self.max_delay
                    )
                    logger.warning("retry_attempt", extra={
                        "attempt": attempt,
                        "max_attempts": self.max_attempts,
                        "delay_seconds": delay,
                        "error": str(e),
                        "correlation_id": correlation_id
                    })
                    await asyncio.sleep(delay)
                else:
                    logger.error("retry_exhausted", extra={
                        "attempts": attempt,
                        "error": str(e),
                        "correlation_id": correlation_id
                    })
        
        raise last_exception
