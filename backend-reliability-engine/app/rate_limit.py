"""
Rate limiting for Pathway Backend
"""

import time
from collections import defaultdict
from typing import Dict, List, Tuple
from app.errors import RateLimitError
from app.logging_utils import get_logger

logger = get_logger()

class RateLimiter:
    """Simple in-memory rate limiter"""
    
    def __init__(self, max_calls: int, time_window: int):
        self.max_calls = max_calls
        self.time_window = time_window
        self.requests: Dict[str, List[float]] = defaultdict(list)
    
    async def acquire(self, user_id: str) -> bool:
        """Check if user can make request"""
        now = time.time()
        cutoff = now - self.time_window
        
        # Clean old requests
        self.requests[user_id] = [
            req_time for req_time in self.requests[user_id]
            if req_time > cutoff
        ]
        
        # Check limit
        if len(self.requests[user_id]) >= self.max_calls:
            logger.warning("rate_limit_exceeded", extra={
                "user_id": user_id,
                "requests": len(self.requests[user_id]),
                "max_calls": self.max_calls
            })
            raise RateLimitError()
        
        # Record request
        self.requests[user_id].append(now)
        return True

class RedisRateLimiter:
    """Redis-backed rate limiter for distributed systems"""
    
    def __init__(self, redis_client, max_calls: int, time_window: int):
        self.redis = redis_client
        self.max_calls = max_calls
        self.time_window = time_window
    
    async def acquire(self, user_id: str, correlation_id: str = None) -> bool:
        """Check rate limit using Redis"""
        key = f"ratelimit:{user_id}"
        
        try:
            # Increment counter
            current = await self.redis.incr(key)
            
            # Set expiry on first request
            if current == 1:
                await self.redis.expire(key, self.time_window)
            
            if current > self.max_calls:
                logger.warning("rate_limit_exceeded_redis", extra={
                    "user_id": user_id,
                    "requests": current,
                    "max_calls": self.max_calls,
                    "correlation_id": correlation_id
                })
                raise RateLimitError(correlation_id)
            
            return True
        except Exception as e:
            logger.error("rate_limit_error", extra={
                "error": str(e),
                "user_id": user_id,
                "correlation_id": correlation_id
            })
            raise
