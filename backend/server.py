"""HAVEN backend — FastAPI app entry point.

Helping Agencies, Volunteers, and Everyone Navigate.
Help has a home.
"""
from __future__ import annotations

import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter
from fastapi.responses import HTMLResponse, JSONResponse
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# ── routers (after env load) ─────────────────────────────────────────────────
from browser_engine import close_all_sessions                          # noqa: E402
from database import db                                                 # noqa: E402
from routers.auth_router import router as auth_router                  # noqa: E402
from routers.admin_router import router as admin_router                # noqa: E402
from routers.architect_router import router as architect_router        # noqa: E402
from routers.bb_router import router as bb_router                      # noqa: E402
from routers.case_ops_router import router as case_ops_router          # noqa: E402
from routers.case_packet_router import router as case_packet_router    # noqa: E402
from routers.cases_router import router as cases_router                # noqa: E402
from routers.forms_resources_router import router as forms_resources_router  # noqa: E402
from routers.integration_request_router import router as integration_request_router  # noqa: E402
from routers.integrations_router import (                              # noqa: E402
    ensure_default_integrations,
    router as integrations_router,
)
from routers.notifications_router import router as notifications_router  # noqa: E402
from routers.templates_router import router as templates_router        # noqa: E402
from routers.users_router import router as users_router                # noqa: E402
from scripts.ensure_indexes import ensure_indexes                      # noqa: E402
from seed import ensure_seed                                           # noqa: E402
from token_refresh_job import TokenRefreshJob                          # noqa: E402

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("haven")

_token_refresh_job: TokenRefreshJob | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _token_refresh_job
    logger.info("HAVEN backend starting up")

    # ── 1. Seed demo data ────────────────────────────────────────────────────
    try:
        await ensure_seed()
        await ensure_default_integrations()
    except Exception as e:
        logger.warning(f"Seed step issue (continuing): {e}")

    # ── 2. Ensure MongoDB indexes (idempotent, background) ───────────────────
    try:
        await ensure_indexes(db)
        logger.info("MongoDB indexes verified")
    except Exception as e:
        logger.warning(f"Index creation issue (non-fatal): {e}")

    # ── 3. Start token auto-refresh background job (FedRAMP IA-5) ───────────
    try:
        _token_refresh_job = TokenRefreshJob(db)
        await _token_refresh_job.start()
        logger.info("Token refresh job started")
    except Exception as e:
        logger.warning(f"Token refresh job failed to start (non-fatal): {e}")

    yield

    # ── Shutdown ─────────────────────────────────────────────────────────────
    logger.info("HAVEN backend shutting down")
    if _token_refresh_job:
        await _token_refresh_job.stop()
    await close_all_sessions()


app = FastAPI(
    title="HAVEN",
    description="Help has a home. — Enterprise-Grade Civic Technology Platform",
    version="4.1.0",
    lifespan=lifespan,
)

api_router = APIRouter(prefix="/api")

# ── Root ──────────────────────────────────────────────────────────────────────
@api_router.get("/")
async def root():
    return {
        "name": "HAVEN",
        "version": "4.1.0",
        "tagline": "Help has a home.",
        "acronym": "Helping Agencies, Volunteers, and Everyone Navigate",
    }


# ── Health endpoints (SOC 2 A1.2 — Availability monitoring) ──────────────────

@api_router.get("/health/live", tags=["health"])
async def health_live():
    """Kubernetes / Docker liveness probe. Returns 200 as long as the process
    is running. Never checks dependencies — a slow DB must not kill the pod."""
    return {"alive": True, "ts": time.time()}


@api_router.get("/health/ready", tags=["health"])
async def health_ready():
    """Readiness probe. Returns 200 only when DB is reachable.
    Used by load balancers to stop routing traffic to an unready instance."""
    try:
        await db.command("ping")
        db_ok = True
        db_status = "connected"
    except Exception as e:
        db_ok = False
        db_status = f"error: {e}"

    status_code = 200 if db_ok else 503
    return JSONResponse(
        status_code=status_code,
        content={"ready": db_ok, "db": db_status, "ts": time.time()},
    )


@api_router.get("/health", tags=["health"])
async def health_full():
    """Full health check — DB, Vault config, LLM engine, and index status.
    Used for SOC 2 A1.2 continuous monitoring evidence.
    Never exposes secrets; only reports configuration state.
    """
    # DB ping
    try:
        await db.command("ping")
        db_ok, db_msg = True, "connected"
    except Exception as e:
        db_ok, db_msg = False, str(e)

    # Vault config
    vault_key_set = bool(os.environ.get("VAULT_MASTER_KEY"))
    signed_url_key_set = bool(os.environ.get("SIGNED_URL_SECRET"))
    vault_using_fallback = not vault_key_set and bool(os.environ.get("JWT_SECRET"))
    vault_status = (
        "configured"  if vault_key_set else
        "fallback_jwt" if vault_using_fallback else
        "NOT_CONFIGURED"
    )

    # LLM engine
    ollama_url = os.environ.get("OLLAMA_URL", "http://ollama:11434")
    gemini_key = bool(os.environ.get("GEMINI_API_KEY"))
    try:
        import httpx
        async with httpx.AsyncClient(timeout=3) as client:
            r = await client.get(f"{ollama_url}/api/tags")
            llm_engine = "ollama_native" if r.status_code == 200 else "ollama_unreachable"
    except Exception:
        llm_engine = "gemini_fallback" if gemini_key else "no_llm_available"

    # Token refresh job
    refresh_job_running = (
        _token_refresh_job is not None and _token_refresh_job.is_running
    )

    overall = "ok" if db_ok else "degraded"

    return {
        "status": overall,
        "version": "4.1.0",
        "ts": time.time(),
        "checks": {
            "database":          {"ok": db_ok,            "detail": db_msg},
            "vault":             {"ok": vault_key_set,    "detail": vault_status},
            "signed_urls":       {"ok": signed_url_key_set, "detail": "configured" if signed_url_key_set else "using_jwt_fallback"},
            "llm_engine":        {"ok": llm_engine != "no_llm_available", "detail": llm_engine},
            "token_refresh_job": {"ok": refresh_job_running, "detail": "running" if refresh_job_running else "stopped"},
        },
    }


# ── Mount all routers ─────────────────────────────────────────────────────────
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(cases_router)
api_router.include_router(case_ops_router)
api_router.include_router(forms_resources_router)
api_router.include_router(bb_router)
api_router.include_router(integrations_router)
api_router.include_router(templates_router)
api_router.include_router(admin_router)
api_router.include_router(architect_router)
api_router.include_router(integration_request_router)
api_router.include_router(notifications_router)
api_router.include_router(case_packet_router)

app.include_router(api_router)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Demo housing form (BB browser-control showcase) ───────────────────────────
DEMO_HOUSING_FORM = """<!doctype html>
<html><head><meta charset='utf-8'><title>Section 8 Housing Application (Demo)</title>
<style>
body{font-family:-apple-system,Inter,Segoe UI,sans-serif;background:#f7f8fb;color:#0b1020;margin:0;padding:40px;}
.wrap{max-width:720px;margin:0 auto;background:#fff;padding:32px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.06);}
h1{font-size:22px;margin:0 0 4px}.sub{color:#5b6b85;margin:0 0 24px;font-size:14px}
label{display:block;font-weight:600;margin:14px 0 6px;font-size:13px;color:#1f2937}
input,select,textarea{width:100%;padding:10px 12px;border-radius:8px;border:1px solid #d1d5db;font-size:14px;box-sizing:border-box;background:#fff}
input:focus,select:focus,textarea:focus{outline:none;border-color:#2563eb;box-shadow:0 0 0 3px rgba(37,99,235,.15)}
.row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
button{margin-top:24px;background:#2563eb;color:#fff;border:0;padding:12px 20px;border-radius:999px;font-weight:600;cursor:pointer}
.badge{display:inline-block;background:#eef2ff;color:#3730a3;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
</style></head><body><div class='wrap'>
<span class='badge'>Housing Authority — Demo</span>
<h1>Section 8 Housing Choice Voucher — Application</h1>
<p class='sub'>This is a HAVEN demo form. BB will fill this on your behalf.</p>
<form id='hcv-form' action='/api/demo/submit-form' method='post'>
  <div class='row'>
    <div><label for='first_name'>First name</label><input id='first_name' name='first_name' required></div>
    <div><label for='last_name'>Last name</label><input id='last_name' name='last_name' required></div>
  </div>
  <label for='email'>Email</label><input id='email' name='email' type='email' required>
  <div class='row'>
    <div><label for='phone'>Phone</label><input id='phone' name='phone' type='tel' required></div>
    <div><label for='dob'>Date of birth</label><input id='dob' name='dob' type='date' required></div>
  </div>
  <label for='address'>Current address</label><input id='address' name='address' required>
  <div class='row'>
    <div><label for='city'>City</label><input id='city' name='city' required></div>
    <div><label for='state'>State</label><select id='state' name='state' required>
      <option value=''>Select</option><option value='CA'>California</option><option value='NY'>New York</option><option value='TX'>Texas</option>
    </select></div>
  </div>
  <div class='row'>
    <div><label for='zip'>ZIP</label><input id='zip' name='zip' required></div>
    <div><label for='household_size'>Household size</label><input id='household_size' name='household_size' type='number' required></div>
  </div>
  <label for='income'>Annual household income</label><input id='income' name='income' type='number' required>
  <label for='reason'>Reason for applying</label><textarea id='reason' name='reason' rows='3'></textarea>
  <button type='submit' id='submit-btn'>Submit application</button>
</form></div></body></html>"""


@app.get("/demo/housing-form", response_class=HTMLResponse)
async def demo_housing_form():
    return DEMO_HOUSING_FORM


@app.post("/api/demo/submit-form")
async def demo_submit_form():
    return {"ok": True, "submission_id": "DEMO-HCV-12345", "message": "Application received (demo)"}
