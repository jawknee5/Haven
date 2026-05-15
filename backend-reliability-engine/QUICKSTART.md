# Backend Reliability Engine - Quick Start

Military-grade API shell for Pathway backend.

## Install

```bash
pip install -r requirements.txt
```

## Run

```bash
python -m app.main
```

Server runs on port 4001 with full reliability instrumentation.

## Test

### 1. Health Check
```bash
curl http://localhost:4001/api/health
```

### 2. Create Case (with resilience)
```bash
curl -X POST http://localhost:4001/api/cases \
  -H "Content-Type: application/json" \
  -d '{"description":"Emergency housing needed"}'
```

### 3. Circuit Breaker Demo (fails then recovers)
```bash
# Trigger failures
curl -X POST http://localhost:4001/api/demo/external-api-call?fail_count=3

# Watch circuit breaker open
curl http://localhost:4001/api/demo/resilience-status
```

### 4. Retry Pattern Demo
```bash
# Will retry 3 times before succeeding
curl -X POST http://localhost:4001/api/demo/retry-pattern?fail_times=2
```

## Features

### Structured Logging
Every operation logged as JSON with:
- correlation_id (trace requests end-to-end)
- user_id
- duration_ms
- service name
- error details

Example:
```json
{
  "timestamp": "2026-05-10T...",
  "level": "INFO",
  "logger": "pathway",
  "message": "request_received",
  "correlation_id": "abc123...",
  "method": "POST",
  "path": "/api/cases",
  "user_id": "user_demo"
}
```

### Correlation IDs
- Automatically generated for each request
- Passed through entire call chain
- Returned in responses
- Enables end-to-end tracing

### Rate Limiting
- Per-user rate limits
- Configurable windows
- Returns 429 on limit exceeded

### Circuit Breaker
- Protects against cascading failures
- 3 states: CLOSED, OPEN, HALF_OPEN
- Automatic recovery testing
- Per-service configuration

### Retry Logic
- Exponential backoff
- Configurable attempts
- Max delay cap

### Error Handling
- Unified error model
- Proper HTTP status codes
- Detailed error context
- Correlation ID in errors

### Security
- CORS configured
- Trusted hosts validation
- Security headers (CSP, X-Frame-Options, etc.)
- Request validation

### Health Checks
- `/api/health` - Full health status
- `/api/health/ready` - Kubernetes readiness probe
- `/api/health/live` - Kubernetes liveness probe

## Architecture

```
Request
  ↓
Correlation ID Middleware
  ↓
Rate Limiting
  ↓
Route Handler
  ↓
Circuit Breaker (if external call)
  ↓
Retry Logic (if needed)
  ↓
Error Handling
  ↓
Response + Correlation ID
  ↓
Timing Logged
```

## Integration with Pathway

### Option 1: Proxy
Run this on port 4001, proxy Pathway backend on port 4000:

```python
# In reliability engine
@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_to_pathway(path: str, request: Request):
    # Forward to port 4000 with resilience
    return await forward_with_resilience(f"http://localhost:4000/api/{path}", request)
```

### Option 2: Direct Integration
Import reliability components into Pathway's Node.js backend:

```javascript
// In Node.js backend
const { circuitBreaker, correlationId } = require('backend-reliability-engine');

app.post('/api/cases', correlationId, async (req, res) => {
  try {
    const result = await circuitBreaker.call(() => enrichCase(req.body));
    res.json(result);
  } catch (e) {
    res.status(503).json({ error: e.message });
  }
});
```

## Files

- `app/main.py` - FastAPI app + Pathway endpoints
- `app/config.py` - Configuration
- `app/logging_utils.py` - Structured JSON logging
- `app/middleware.py` - Correlation ID, timing, security
- `app/errors.py` - Unified error model
- `app/rate_limit.py` - Rate limiting
- `app/resilience.py` - Circuit breaker, retries
- `app/routes/health.py` - Health checks
- `app/routes/external_demo.py` - Resilience demos

## Production

For production:
1. Set `ENVIRONMENT=production`
2. Enable Redis for distributed rate limiting
3. Configure log aggregation (DataDog, Splunk, etc.)
4. Set up alerting on error rates
5. Deploy to Kubernetes with health probes configured

Environment variables:
```bash
ENVIRONMENT=production
LOG_LEVEL=INFO
RATE_LIMIT_ENABLED=true
CIRCUIT_BREAKER_ENABLED=true
REDIS_URL=redis://redis:6379
CORS_ORIGINS=https://pathway.example.com
```

## Monitoring

Watch logs:
```bash
tail -f app.log | jq 'select(.level=="ERROR")'
```

Get circuit breaker status:
```bash
curl http://localhost:4001/api/demo/resilience-status | jq
```

## Next Steps

- [ ] Add Prometheus metrics export
- [ ] Add distributed tracing (Jaeger)
- [ ] Add request/response caching
- [ ] Add request signing
- [ ] Add API versioning
- [ ] Add GraphQL support

This is your foundation. Build on it. ✅
