"""
Configuration for Pathway Backend Reliability Engine
"""

import os
from dataclasses import dataclass

@dataclass
class Settings:
    # App
    APP_VERSION = "4.0.0"
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    PORT = int(os.getenv("PORT", 4001))
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT = "json"  # structured JSON logging
    
    # Security
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:4000").split(",")
    RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
    
    # Resilience
    CIRCUIT_BREAKER_ENABLED = os.getenv("CIRCUIT_BREAKER_ENABLED", "true").lower() == "true"
    RETRY_MAX_ATTEMPTS = int(os.getenv("RETRY_MAX_ATTEMPTS", 3))
    TIMEOUT_SECONDS = int(os.getenv("TIMEOUT_SECONDS", 30))
    
    # External APIs
    OPENAI_TIMEOUT = int(os.getenv("OPENAI_TIMEOUT", 10))
    AGENCY_API_TIMEOUT = int(os.getenv("AGENCY_API_TIMEOUT", 15))
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///pathway.db")
    
    # Redis (for rate limiting, caching)
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    REDIS_ENABLED = os.getenv("REDIS_ENABLED", "false").lower() == "true"

settings = Settings()
