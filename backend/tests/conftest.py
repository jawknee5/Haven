"""Shared pytest fixtures for HAVEN backend tests."""
import os
import pytest
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load frontend .env to get REACT_APP_BACKEND_URL
load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")

BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE}/api"

DEMO_PW = "Demo2026!"
CASEWORKER_EMAIL = "caseworker@haven.demo"
RESIDENT_EMAIL = "resident@haven.demo"
ADMIN_EMAIL = "admin@haven.demo"


def _login(email, pw=DEMO_PW):
    r = requests.post(f"{API}/auth/login", json={"email": email, "password": pw}, timeout=20)
    r.raise_for_status()
    return r.json()


@pytest.fixture(scope="session")
def api_base():
    return API


@pytest.fixture(scope="session")
def caseworker():
    return _login(CASEWORKER_EMAIL)


@pytest.fixture(scope="session")
def resident():
    return _login(RESIDENT_EMAIL)


@pytest.fixture(scope="session")
def admin():
    return _login(ADMIN_EMAIL)


@pytest.fixture
def cw_headers(caseworker):
    return {"Authorization": f"Bearer {caseworker['token']}"}


@pytest.fixture
def res_headers(resident):
    return {"Authorization": f"Bearer {resident['token']}"}


@pytest.fixture
def admin_headers(admin):
    return {"Authorization": f"Bearer {admin['token']}"}
