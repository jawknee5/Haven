# Backend Reliability Engine - Pathway Edition

Military-grade API shell for Pathway backend.

## Features

- **Structured JSON Logging** - Every operation logged with context
- **Correlation IDs** - Trace requests end-to-end
- **Unified Error Model** - Consistent error responses
- **Rate Limiting** - Protect BB endpoints
- **Circuit Breakers** - Resilience for external APIs
- **Health Checks** - Monitor all Pathway engines
- **Timing Instrumentation** - Performance visibility
- **Retry Logic** - Automatic recovery
- **Security Headers** - CORS, CSP, etc.

## Quick Start

```bash
pip install -r requirements.txt
python -m app.main
```

Server runs on port 4001 with full reliability instrumentation.

## Architecture

```
Request → Correlation ID → Logging → Rate Limit → Route Handler
          ↓
       OTEE/HTCRM/VAULT Operations
          ↓
       Resilience Layer (Circuit Breaker, Retries)
          ↓
       Error Handling → Structured Response → Timing Middleware
          ↓
       Response → Correlation ID Logged
```

## Files

- `app/main.py` - FastAPI application
- `app/config.py` - Configuration
- `app/logging_utils.py` - Structured logging
- `app/middleware.py` - Request/response middleware
- `app/errors.py` - Error models
- `app/rate_limit.py` - Rate limiting
- `app/resilience.py` - Circuit breaker & retries
- `app/routes/health.py` - Health checks
- `app/routes/external_demo.py` - Resilience demo
- `requirements.txt` - Dependencies

## Integration with Pathway

Works with:
- Pathway backend/src/server.ts (Node.js)
- Can proxy or integrate directly
- Adds reliability layer to existing endpoints
- Zero changes to Pathway core logic

## Production Ready

- ✅ Structured logging
- ✅ Error tracking
- ✅ Performance monitoring
- ✅ Security hardened
- ✅ High availability
- ✅ Battle-tested patterns
