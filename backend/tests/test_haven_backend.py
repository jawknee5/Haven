"""HAVEN backend comprehensive API tests.

Covers: health, auth, cases, tasks, messages, documents, forms, resources,
analytics, BB chat/forms/applications, BB Browser Control (Playwright),
and role enforcement.
"""
import io
import os
import time
import base64
import uuid
import pytest
import requests

from conftest import API, DEMO_PW

TIMEOUT = 60
BB_TIMEOUT = 120  # BB / Playwright calls can be slow


# =============== HEALTH ===============
def test_health():
    r = requests.get(f"{API}/health", timeout=TIMEOUT)
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# =============== AUTH ===============
class TestAuth:
    def test_login_caseworker(self, caseworker):
        assert "token" in caseworker and caseworker["token"]
        assert caseworker["user"]["email"] == "caseworker@haven.demo"
        assert caseworker["user"]["role"] == "caseworker"

    def test_login_resident(self, resident):
        assert resident["user"]["role"] == "resident"

    def test_login_admin(self, admin):
        assert admin["user"]["role"] == "admin"

    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": "caseworker@haven.demo", "password": "wrong"}, timeout=TIMEOUT)
        assert r.status_code == 401

    def test_register_new_user(self):
        email = f"test_{uuid.uuid4().hex[:8]}@haven.demo"
        r = requests.post(f"{API}/auth/register", json={
            "email": email, "password": "Pass123!", "name": "Test User", "role": "resident"
        }, timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "token" in body and body["user"]["email"] == email
        assert body["user"]["role"] == "resident"

    def test_register_duplicate(self):
        r = requests.post(f"{API}/auth/register", json={
            "email": "caseworker@haven.demo", "password": "x", "name": "x", "role": "resident"
        }, timeout=TIMEOUT)
        assert r.status_code == 409

    def test_me(self, cw_headers):
        r = requests.get(f"{API}/auth/me", headers=cw_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        assert r.json()["email"] == "caseworker@haven.demo"

    def test_me_no_token(self):
        r = requests.get(f"{API}/auth/me", timeout=TIMEOUT)
        assert r.status_code == 401


# =============== CASES ===============
class TestCases:
    def test_list_cases_caseworker_returns_all(self, cw_headers):
        r = requests.get(f"{API}/cases", headers=cw_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        cases = r.json()
        assert isinstance(cases, list)
        assert len(cases) >= 5, f"Expected >=5 seeded cases, got {len(cases)}"

    def test_list_cases_resident_only_own(self, res_headers, resident):
        r = requests.get(f"{API}/cases", headers=res_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        for c in r.json():
            assert c["resident_id"] == resident["user"]["id"]

    def test_case_detail(self, cw_headers):
        r = requests.get(f"{API}/cases", headers=cw_headers, timeout=TIMEOUT)
        case_id = r.json()[0]["id"]
        r2 = requests.get(f"{API}/cases/{case_id}", headers=cw_headers, timeout=TIMEOUT)
        assert r2.status_code == 200
        body = r2.json()
        for k in ("case", "tasks", "messages", "documents"):
            assert k in body
        assert body["case"]["id"] == case_id

    def test_case_update_status(self, cw_headers):
        r = requests.get(f"{API}/cases", headers=cw_headers, timeout=TIMEOUT)
        case_id = r.json()[0]["id"]
        r2 = requests.patch(f"{API}/cases/{case_id}", json={"status": "active"}, headers=cw_headers, timeout=TIMEOUT)
        assert r2.status_code == 200
        assert r2.json()["status"] == "active"

    def test_case_claim(self, cw_headers, caseworker):
        r = requests.get(f"{API}/cases", headers=cw_headers, timeout=TIMEOUT)
        # pick a case (any)
        case_id = r.json()[-1]["id"]
        r2 = requests.post(f"{API}/cases/{case_id}/claim", headers=cw_headers, timeout=TIMEOUT)
        assert r2.status_code == 200
        assert r2.json()["caseworker_id"] == caseworker["user"]["id"]
        assert r2.json()["status"] == "active"


# =============== TASKS / MESSAGES / DOCUMENTS ===============
class TestCaseOps:
    @pytest.fixture(scope="class")
    def shared_case_id(self):
        # Login here so this class-scoped fixture doesn't depend on function-scoped ones
        from conftest import _login
        cw = _login("caseworker@haven.demo")
        r = requests.get(f"{API}/cases", headers={"Authorization": f"Bearer {cw['token']}"}, timeout=TIMEOUT)
        return r.json()[0]["id"]

    def test_create_task(self, cw_headers, shared_case_id):
        r = requests.post(f"{API}/tasks", headers=cw_headers, json={
            "case_id": shared_case_id, "title": "TEST_task", "priority": "high"
        }, timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        task = r.json()
        assert task["title"] == "TEST_task"
        pytest.shared_task_id = task["id"]

    def test_list_tasks_by_case(self, cw_headers, shared_case_id):
        r = requests.get(f"{API}/tasks?case_id={shared_case_id}", headers=cw_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        assert any(t["title"] == "TEST_task" for t in r.json())

    def test_update_task(self, cw_headers):
        tid = pytest.shared_task_id
        r = requests.patch(f"{API}/tasks/{tid}", headers=cw_headers, json={"status": "done"}, timeout=TIMEOUT)
        assert r.status_code == 200
        assert r.json()["status"] == "done"

    def test_send_message(self, cw_headers, shared_case_id):
        r = requests.post(f"{API}/messages", headers=cw_headers, json={
            "case_id": shared_case_id, "content": "TEST_message hello"
        }, timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        assert r.json()["content"] == "TEST_message hello"

    def test_list_messages(self, cw_headers, shared_case_id):
        r = requests.get(f"{API}/messages?case_id={shared_case_id}", headers=cw_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        assert any(m["content"] == "TEST_message hello" for m in r.json())

    def test_upload_document(self, cw_headers, shared_case_id):
        files = {"file": ("test.txt", io.BytesIO(b"hello world"), "text/plain")}
        data = {"case_id": shared_case_id, "type": "other"}
        r = requests.post(f"{API}/documents", headers=cw_headers, files=files, data=data, timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        doc = r.json()
        assert doc["filename"] == "test.txt"
        assert doc["case_id"] == shared_case_id
        pytest.shared_doc_id = doc["id"]

    def test_verify_document(self, cw_headers):
        did = pytest.shared_doc_id
        r = requests.patch(f"{API}/documents/{did}/verify?verified=true", headers=cw_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        assert r.json()["verified"] is True


# =============== FORMS ===============
class TestForms:
    def test_list_forms(self, cw_headers):
        r = requests.get(f"{API}/forms", headers=cw_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_form(self, cw_headers):
        r = requests.post(f"{API}/forms", headers=cw_headers, json={
            "name": "TEST_form", "description": "x",
            "fields": [{"label": "Name", "type": "text", "name": "name", "required": True}],
            "category": "intake"
        }, timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        pytest.shared_form_id = r.json()["id"]

    def test_update_form(self, cw_headers):
        fid = pytest.shared_form_id
        r = requests.patch(f"{API}/forms/{fid}", headers=cw_headers, json={"name": "TEST_form_updated"}, timeout=TIMEOUT)
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_form_updated"

    def test_delete_form(self, cw_headers):
        fid = pytest.shared_form_id
        r = requests.delete(f"{API}/forms/{fid}", headers=cw_headers, timeout=TIMEOUT)
        assert r.status_code == 200


# =============== RESOURCES ===============
def test_resources_seeded():
    r = requests.get(f"{API}/resources", timeout=TIMEOUT)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 9, f"Expected >=9 seeded resources, got {len(data)}"


# =============== ANALYTICS ===============
class TestAnalytics:
    def test_caseworker_analytics(self, cw_headers):
        r = requests.get(f"{API}/analytics/caseworker", headers=cw_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        for k in ("total_cases", "active_cases", "open_tasks", "high_urgency"):
            assert k in r.json()

    def test_admin_analytics(self, admin_headers):
        r = requests.get(f"{API}/analytics/admin", headers=admin_headers, timeout=TIMEOUT)
        assert r.status_code == 200
        for k in ("total_users", "residents", "caseworkers", "total_cases"):
            assert k in r.json()


# =============== BB AI ===============
class TestBBAI:
    def test_bb_intro(self, cw_headers):
        r = requests.get(f"{API}/bb/intro", headers=cw_headers, timeout=BB_TIMEOUT)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "reply" in body and body["reply"]
        assert body["role"] == "caseworker"

    def test_bb_chat(self, cw_headers):
        sid = f"test-sess-{uuid.uuid4().hex[:6]}"
        r = requests.post(f"{API}/bb/chat", headers=cw_headers, json={
            "message": "Hello BB, what can you help me with?",
            "session_id": sid, "context": {}
        }, timeout=BB_TIMEOUT)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("reply"), "BB reply is empty"
        assert "intent" in body

    def test_bb_chat_crisis_classification(self, res_headers):
        # crisis-style message — verify intent classification exists
        sid = f"test-sess-{uuid.uuid4().hex[:6]}"
        r = requests.post(f"{API}/bb/chat", headers=res_headers, json={
            "message": "I am being evicted tomorrow and have nowhere to go",
            "session_id": sid
        }, timeout=BB_TIMEOUT)
        assert r.status_code == 200
        body = r.json()
        assert body.get("reply")
        assert "intent" in body

    def test_bb_form_analyze(self, cw_headers):
        html = """<form><input id='first_name' name='first_name'/>
                  <input id='email' name='email' type='email'/>
                  <input id='phone' name='phone' type='tel'/></form>"""
        r = requests.post(f"{API}/bb/forms/analyze", headers=cw_headers,
                          json={"form_html": html}, timeout=BB_TIMEOUT)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("field_count", 0) >= 3
        assert isinstance(body.get("fields"), list)

    def test_bb_form_autofill(self, cw_headers):
        html = """<form><input id='first_name' name='first_name'/>
                  <input id='last_name' name='last_name'/>
                  <input id='email' name='email' type='email'/></form>"""
        r = requests.post(f"{API}/bb/forms/autofill", headers=cw_headers,
                          json={"form_html": html}, timeout=BB_TIMEOUT)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "mapping" in body and "fields" in body


# =============== BB APPLICATION TRACKING ===============
class TestBBAppTracking:
    def test_track_and_summary(self, cw_headers):
        # need a case_id
        cases = requests.get(f"{API}/cases", headers=cw_headers, timeout=TIMEOUT).json()
        case_id = cases[0]["id"]
        r = requests.post(f"{API}/bb/applications/track", headers=cw_headers, json={
            "case_id": case_id, "agency_name": "TEST_Housing Authority",
            "application_id": "HA-001", "required_documents": ["id", "income"]
        }, timeout=TIMEOUT)
        assert r.status_code == 200, r.text
        assert r.json()["agency_name"] == "TEST_Housing Authority"

        s = requests.get(f"{API}/bb/applications/summary", headers=cw_headers, timeout=TIMEOUT)
        assert s.status_code == 200
        body = s.json()
        assert "count" in body and "applications" in body
        assert body["count"] >= 1


# =============== BB BROWSER CONTROL (PLAYWRIGHT) — SHOWSTOPPER ===============
class TestBBBrowserControl:
    """Real Playwright headless Chromium tests. Cleans up at end."""

    DEMO_URL = "http://localhost:8001/demo/housing-form"

    @pytest.fixture(scope="class")
    def cw_token(self):
        from conftest import _login
        return _login("caseworker@haven.demo")["token"]

    @pytest.fixture(scope="class")
    def headers(self, cw_token):
        return {"Authorization": f"Bearer {cw_token}"}

    @pytest.fixture(scope="class")
    def session_info(self, headers):
        r = requests.post(f"{API}/bb/browser/start", headers=headers,
                          json={"url": self.DEMO_URL}, timeout=BB_TIMEOUT)
        assert r.status_code == 200, f"browser/start failed: {r.text}"
        body = r.json()
        assert body.get("session_id"), "no session_id"
        assert body.get("screenshot"), "no screenshot returned"
        # screenshot should be base64 (likely with data: prefix)
        ss = body["screenshot"]
        b64part = ss.split(",", 1)[1] if ss.startswith("data:") else ss
        try:
            decoded = base64.b64decode(b64part, validate=False)
            assert len(decoded) > 1000, "screenshot too small to be real"
        except Exception as e:
            pytest.fail(f"screenshot not valid base64: {e}")
        yield body
        # teardown
        try:
            requests.post(f"{API}/bb/browser/stop?session_id={body['session_id']}",
                          headers=headers, timeout=TIMEOUT)
        except Exception:
            pass

    def test_start_returned_demo_form(self, session_info):
        # the title or url should reflect housing form
        url = session_info.get("url", "")
        title = session_info.get("title", "")
        assert "housing-form" in url or "Housing" in title or "Section 8" in title, \
            f"unexpected url/title: {url} / {title}"

    def test_extract_fields(self, headers, session_info):
        r = requests.post(f"{API}/bb/browser/action", headers=headers, json={
            "session_id": session_info["session_id"], "action": "extract", "payload": {}
        }, timeout=BB_TIMEOUT)
        assert r.status_code == 200, r.text
        body = r.json()
        fields = body.get("result", {}).get("fields", [])
        assert len(fields) >= 12, f"Expected >=12 fields, got {len(fields)}: {fields}"

    def test_fill_single_field(self, headers, session_info):
        r = requests.post(f"{API}/bb/browser/action", headers=headers, json={
            "session_id": session_info["session_id"], "action": "fill",
            "payload": {"selector": "#first_name", "value": "Maria"}
        }, timeout=BB_TIMEOUT)
        assert r.status_code == 200, r.text
        assert r.json().get("result", {}).get("ok") is True
        assert r.json().get("screenshot")

    def test_autofill_all(self, headers, session_info):
        mapping = {
            "#first_name": "Maria",
            "#last_name": "Hernandez",
            "#email": "maria@haven.test",
            "#phone": "555-0100",
            "#city": "Oakland",
        }
        r = requests.post(f"{API}/bb/browser/action", headers=headers, json={
            "session_id": session_info["session_id"], "action": "autofill_all",
            "payload": {"mapping": mapping}
        }, timeout=BB_TIMEOUT)
        assert r.status_code == 200, r.text
        body = r.json()
        filled = body.get("result", {}).get("filled", [])
        assert len(filled) >= 3, f"expected several fields filled, got {filled}"

    def test_screenshot_action(self, headers, session_info):
        r = requests.post(f"{API}/bb/browser/action", headers=headers, json={
            "session_id": session_info["session_id"], "action": "screenshot", "payload": {}
        }, timeout=BB_TIMEOUT)
        assert r.status_code == 200
        assert r.json().get("screenshot")

    def test_navigate(self, headers, session_info):
        r = requests.post(f"{API}/bb/browser/action", headers=headers, json={
            "session_id": session_info["session_id"], "action": "navigate",
            "payload": {"url": self.DEMO_URL}
        }, timeout=BB_TIMEOUT)
        assert r.status_code == 200, r.text
        assert "housing-form" in r.json().get("url", "")


# =============== ROLE ENFORCEMENT ===============
class TestRoleEnforcement:
    def test_resident_cannot_view_other_case(self, res_headers, cw_headers):
        # find a case belonging to someone other than resident
        cases = requests.get(f"{API}/cases", headers=cw_headers, timeout=TIMEOUT).json()
        me_r = requests.get(f"{API}/auth/me", headers=res_headers, timeout=TIMEOUT).json()
        other = next((c for c in cases if c["resident_id"] != me_r["id"]), None)
        if not other:
            pytest.skip("no other-owned case to test against")
        r = requests.get(f"{API}/cases/{other['id']}", headers=res_headers, timeout=TIMEOUT)
        assert r.status_code == 403

    def test_resident_cannot_create_task(self, res_headers, cw_headers):
        cases = requests.get(f"{API}/cases", headers=cw_headers, timeout=TIMEOUT).json()
        case_id = cases[0]["id"]
        r = requests.post(f"{API}/tasks", headers=res_headers, json={
            "case_id": case_id, "title": "x"
        }, timeout=TIMEOUT)
        assert r.status_code == 403

    def test_resident_cannot_delete_form(self, res_headers, cw_headers):
        # create a form as caseworker so there's an id
        r0 = requests.post(f"{API}/forms", headers=cw_headers, json={
            "name": "TEST_role_form", "fields": [], "category": "intake"
        }, timeout=TIMEOUT)
        fid = r0.json()["id"]
        r = requests.delete(f"{API}/forms/{fid}", headers=res_headers, timeout=TIMEOUT)
        assert r.status_code == 403
        # cleanup
        requests.delete(f"{API}/forms/{fid}", headers=cw_headers, timeout=TIMEOUT)
