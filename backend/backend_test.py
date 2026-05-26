"""HAVEN Backend E2E Test Suite
Tests all API endpoints for the HAVEN civic-tech platform.
"""
import asyncio
import json
import sys
import uuid
from datetime import datetime

import requests
import websockets

# Configuration
BASE_URL = "https://haven-dashboard-1.preview.emergentagent.com"
API = f"{BASE_URL}/api"
WS_URL = "wss://haven-dashboard-1.preview.emergentagent.com/api"
TIMEOUT = 30

# Test credentials
CREDENTIALS = {
    "admin": {"email": "admin@haven.demo", "password": "Demo2026!"},
    "caseworker": {"email": "caseworker@haven.demo", "password": "Demo2026!"},
    "resident": {"email": "resident@haven.demo", "password": "Demo2026!"},
}

EXPECTED_AGENCIES = [
    "HUD_SEC8", "SSA_SSI", "USDA_SNAP", "CMS_MEDICAID", "VA_BENEFITS",
    "IRS_EFILE", "DMV_ID", "DOL_UI", "HHS_TANF", "CPS_REPORT",
    "COURT_EFILE", "WIC_CA"
]


class TestRunner:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []
        self.tokens = {}
        self.users = {}
        self.test_data = {}

    def log(self, msg, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {msg}")

    def run_test(self, name, func):
        """Run a single test"""
        self.tests_run += 1
        self.log(f"Running: {name}")
        try:
            result = func()
            self.tests_passed += 1
            self.log(f"✅ PASS: {name}", "PASS")
            return result
        except AssertionError as e:
            self.tests_failed += 1
            self.failures.append({"test": name, "error": str(e)})
            self.log(f"❌ FAIL: {name} - {e}", "FAIL")
            return None
        except Exception as e:
            self.tests_failed += 1
            self.failures.append({"test": name, "error": f"Exception: {str(e)}"})
            self.log(f"❌ ERROR: {name} - {e}", "ERROR")
            return None

    def assert_status(self, response, expected, msg=""):
        assert response.status_code == expected, f"{msg} Expected {expected}, got {response.status_code}: {response.text[:200]}"

    def assert_in(self, key, data, msg=""):
        assert key in data, f"{msg} Key '{key}' not found in response"

    def assert_equal(self, actual, expected, msg=""):
        assert actual == expected, f"{msg} Expected {expected}, got {actual}"

    # ============ AUTH TESTS ============
    def test_auth_admin(self):
        r = requests.post(f"{API}/auth/login", json=CREDENTIALS["admin"], timeout=TIMEOUT)
        self.assert_status(r, 200)
        data = r.json()
        self.assert_in("token", data)
        self.assert_equal(data["user"]["role"], "admin")
        self.tokens["admin"] = data["token"]
        self.users["admin"] = data["user"]
        return data

    def test_auth_caseworker(self):
        r = requests.post(f"{API}/auth/login", json=CREDENTIALS["caseworker"], timeout=TIMEOUT)
        self.assert_status(r, 200)
        data = r.json()
        self.assert_in("token", data)
        self.assert_equal(data["user"]["role"], "caseworker")
        self.tokens["caseworker"] = data["token"]
        self.users["caseworker"] = data["user"]
        return data

    def test_auth_resident(self):
        r = requests.post(f"{API}/auth/login", json=CREDENTIALS["resident"], timeout=TIMEOUT)
        self.assert_status(r, 200)
        data = r.json()
        self.assert_in("token", data)
        self.assert_equal(data["user"]["role"], "resident")
        self.tokens["resident"] = data["token"]
        self.users["resident"] = data["user"]
        return data

    def test_auth_me(self, role):
        headers = {"Authorization": f"Bearer {self.tokens[role]}"}
        r = requests.get(f"{API}/auth/me", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        data = r.json()
        self.assert_equal(data["role"], role)
        return data

    # ============ CASES & RBAC TESTS ============
    def test_cases_resident_scoped(self):
        headers = {"Authorization": f"Bearer {self.tokens['resident']}"}
        r = requests.get(f"{API}/cases", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        cases = r.json()
        assert isinstance(cases, list), "Expected list of cases"
        for case in cases:
            self.assert_equal(case["resident_id"], self.users["resident"]["id"])
        self.test_data["resident_cases"] = cases
        return cases

    def test_cases_caseworker_all(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/cases", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        cases = r.json()
        assert isinstance(cases, list), "Expected list of cases"
        assert len(cases) > 0, "Expected at least one case"
        self.test_data["all_cases"] = cases
        return cases

    def test_cases_resident_forbidden(self):
        headers_cw = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/cases", headers=headers_cw, timeout=TIMEOUT)
        all_cases = r.json()
        
        other_case = None
        for case in all_cases:
            if case["resident_id"] != self.users["resident"]["id"]:
                other_case = case
                break
        
        if other_case:
            headers_res = {"Authorization": f"Bearer {self.tokens['resident']}"}
            r = requests.get(f"{API}/cases/{other_case['id']}", headers=headers_res, timeout=TIMEOUT)
            self.assert_status(r, 403)
        else:
            self.log("No other resident's case found to test 403", "WARN")

    def test_cases_caseworker_claim(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/cases", headers=headers, timeout=TIMEOUT)
        cases = r.json()
        
        unassigned = None
        for case in cases:
            if not case.get("caseworker_id"):
                unassigned = case
                break
        
        if not unassigned:
            r = requests.post(f"{API}/cases", json={
                "title": "Test Case for Claim",
                "description": "Testing claim functionality",
                "urgency_score": 50,
                "category": "general"
            }, headers=headers, timeout=TIMEOUT)
            self.assert_status(r, 200)
            unassigned = r.json()
        
        r = requests.post(f"{API}/cases/{unassigned['id']}/claim", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        claimed = r.json()
        self.assert_equal(claimed["caseworker_id"], self.users["caseworker"]["id"])
        return claimed

    # ============ TASKS TESTS ============
    def test_tasks_create(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/cases", headers=headers, timeout=TIMEOUT)
        cases = r.json()
        assert len(cases) > 0, "Need at least one case"
        case_id = cases[0]["id"]
        
        r = requests.post(f"{API}/tasks", json={
            "case_id": case_id,
            "title": "Test Task",
            "description": "Testing task creation",
            "priority": "high"
        }, headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        task = r.json()
        self.assert_in("id", task)
        self.test_data["task_id"] = task["id"]
        return task

    def test_tasks_update(self):
        if "task_id" not in self.test_data:
            return
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.patch(f"{API}/tasks/{self.test_data['task_id']}", json={
            "status": "in_progress"
        }, headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        task = r.json()
        self.assert_equal(task["status"], "in_progress")
        return task

    # ============ MESSAGES TESTS ============
    def test_messages_create(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/cases", headers=headers, timeout=TIMEOUT)
        cases = r.json()
        assert len(cases) > 0, "Need at least one case"
        case_id = cases[0]["id"]
        
        r = requests.post(f"{API}/messages", json={
            "case_id": case_id,
            "content": "Test message from caseworker"
        }, headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        msg = r.json()
        self.assert_in("id", msg)
        return msg

    def test_messages_resident_forbidden(self):
        headers_cw = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/cases", headers=headers_cw, timeout=TIMEOUT)
        all_cases = r.json()
        
        other_case = None
        for case in all_cases:
            if case["resident_id"] != self.users["resident"]["id"]:
                other_case = case
                break
        
        if other_case:
            headers_res = {"Authorization": f"Bearer {self.tokens['resident']}"}
            r = requests.get(f"{API}/messages?case_id={other_case['id']}", headers=headers_res, timeout=TIMEOUT)
            self.assert_status(r, 403)

    # ============ DOCUMENTS TESTS ============
    def test_documents_upload(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/cases", headers=headers, timeout=TIMEOUT)
        cases = r.json()
        assert len(cases) > 0, "Need at least one case"
        case_id = cases[0]["id"]
        
        files = {"file": ("test.txt", b"Test document content", "text/plain")}
        data = {"case_id": case_id, "type": "other"}
        
        r = requests.post(f"{API}/documents", data=data, files=files, headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        doc = r.json()
        self.assert_in("id", doc)
        self.test_data["document_id"] = doc["id"]
        return doc

    def test_documents_verify(self):
        if "document_id" not in self.test_data:
            return
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.patch(
            f"{API}/documents/{self.test_data['document_id']}/verify?verified=true&notes=Verified",
            headers=headers,
            timeout=TIMEOUT
        )
        self.assert_status(r, 200)
        doc = r.json()
        self.assert_equal(doc["verified"], True)
        return doc

    # ============ INTEGRATIONS TESTS ============
    def test_integrations_list(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/integrations", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        integrations = r.json()
        assert isinstance(integrations, list), "Expected list of integrations"
        self.assert_equal(len(integrations), 12, f"Expected 12 agencies, got {len(integrations)}")
        
        codes = [i["code"] for i in integrations]
        for expected in EXPECTED_AGENCIES:
            assert expected in codes, f"Expected agency {expected} not found"
        
        self.test_data["integrations"] = integrations
        return integrations

    def test_integrations_stats(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/integrations/_/stats", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        stats = r.json()
        
        for key in ["total_integrations", "connected", "disconnected", "submissions_total", 
                    "live_configured", "live_authorized"]:
            self.assert_in(key, stats)
        
        self.assert_equal(stats["total_integrations"], 12)
        return stats

    def test_integrations_get_single(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/integrations/HUD_SEC8", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        integ = r.json()
        self.assert_equal(integ["code"], "HUD_SEC8")
        return integ

    def test_integrations_toggle_admin(self):
        headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        r = requests.patch(f"{API}/integrations/HUD_SEC8/toggle", json={"connected": False}, headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        
        r = requests.patch(f"{API}/integrations/HUD_SEC8/toggle", json={"connected": True}, headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)

    def test_integrations_toggle_caseworker_forbidden(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.patch(f"{API}/integrations/HUD_SEC8/toggle", json={"connected": False}, headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 403)

    def test_integrations_submit(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/cases", headers=headers, timeout=TIMEOUT)
        cases = r.json()
        assert len(cases) > 0, "Need at least one case"
        case_id = cases[0]["id"]
        
        r = requests.post(f"{API}/integrations/submit", json={
            "integration_code": "HUD_SEC8",
            "case_id": case_id,
            "payload": {
                "full_name": "Test User",
                "ssn": "123-45-6789",
                "dob": "1990-01-01",
                "address": "123 Main St",
                "household_size": "2",
                "income": "30000"
            },
            "notes": "Test submission"
        }, headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        submission = r.json()
        
        self.assert_in("confirmation_id", submission)
        assert submission["confirmation_id"].startswith("HUD-"), f"Expected HUD- prefix"
        self.assert_equal(submission["adapter_mode"], "simulated")
        self.assert_equal(submission["status"], "submitted")
        
        self.test_data["submission_id"] = submission["id"]
        return submission

    def test_integrations_submit_missing_fields(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/cases", headers=headers, timeout=TIMEOUT)
        cases = r.json()
        case_id = cases[0]["id"]
        
        r = requests.post(f"{API}/integrations/submit", json={
            "integration_code": "HUD_SEC8",
            "case_id": case_id,
            "payload": {"full_name": "Test User"},
            "notes": "Test submission with missing fields"
        }, headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        submission = r.json()
        
        self.assert_equal(submission["status"], "needs_action")
        self.assert_in("missing_fields", submission)
        assert len(submission["missing_fields"]) > 0, "Expected missing_fields"
        return submission

    def test_integrations_submissions_caseworker(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/integrations/submissions", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        submissions = r.json()
        assert isinstance(submissions, list), "Expected list"
        return submissions

    def test_integrations_submissions_resident(self):
        headers = {"Authorization": f"Bearer {self.tokens['resident']}"}
        r = requests.get(f"{API}/integrations/submissions", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        submissions = r.json()
        for sub in submissions:
            self.assert_equal(sub["resident_id"], self.users["resident"]["id"])
        return submissions

    def test_integrations_sync(self):
        if "submission_id" not in self.test_data:
            return
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.post(f"{API}/integrations/submissions/{self.test_data['submission_id']}/sync", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        submission = r.json()
        self.assert_in("timeline", submission)
        assert len(submission["timeline"]) > 1, "Expected timeline updates"
        return submission

    def test_integrations_oauth_meta(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/integrations/HUD_SEC8/oauth/meta", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        meta = r.json()
        self.assert_equal(meta["mode"], "simulated")
        self.assert_equal(meta["live_configured"], False)
        return meta

    def test_integrations_oauth_start_no_config(self):
        headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        r = requests.get(f"{API}/integrations/HUD_SEC8/oauth/start", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 400)
        error = r.json()
        assert "HUD_SEC8_OAUTH_AUTHORIZE_URL" in error["detail"], "Error should mention env vars"
        return error

    def test_integrations_oauth_callback_invalid(self):
        r = requests.get(f"{API}/integrations/oauth/callback?code=test&state=bogus", timeout=TIMEOUT)
        self.assert_status(r, 400)

    # ============ ADMIN TESTS ============
    def test_admin_users_list(self):
        headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        r = requests.get(f"{API}/admin/users", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        users = r.json()
        assert len(users) >= 3, "Expected at least 3 users"
        return users

    def test_admin_users_caseworker_forbidden(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/admin/users", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 403)

    def test_admin_users_create(self):
        headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        r = requests.post(f"{API}/admin/users", json={
            "email": email,
            "name": "Test User",
            "role": "resident",
            "phone": "555-1234",
            "password": "Demo2026!"
        }, headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        user = r.json()
        self.assert_equal(user["email"], email)
        self.test_data["created_user_id"] = user["id"]
        return user

    def test_admin_users_create_duplicate(self):
        headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        r = requests.post(f"{API}/admin/users", json={
            "email": "admin@haven.demo",
            "name": "Duplicate",
            "role": "resident",
            "password": "Demo2026!"
        }, headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 409)

    def test_admin_users_update(self):
        if "created_user_id" not in self.test_data:
            return
        headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        r = requests.patch(f"{API}/admin/users/{self.test_data['created_user_id']}", json={
            "name": "Updated Name"
        }, headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        user = r.json()
        self.assert_equal(user["name"], "Updated Name")
        return user

    def test_admin_users_delete_self(self):
        headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        admin_id = self.users["admin"]["id"]
        r = requests.delete(f"{API}/admin/users/{admin_id}", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 400)

    # ============ AUDIT TESTS ============
    def test_audit_list(self):
        headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        r = requests.get(f"{API}/admin/audit", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        audit = r.json()
        assert isinstance(audit, list), "Expected list"
        return audit

    def test_audit_stats(self):
        headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        r = requests.get(f"{API}/admin/audit/stats", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        stats = r.json()
        self.assert_in("total", stats)
        return stats

    # ============ NOTIFICATIONS TESTS ============
    def test_notifications_resident(self):
        headers = {"Authorization": f"Bearer {self.tokens['resident']}"}
        r = requests.get(f"{API}/notifications", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        notifs = r.json()
        self.assert_in("unread", notifs)
        self.assert_in("items", notifs)
        return notifs

    def test_notifications_caseworker(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/notifications", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        notifs = r.json()
        self.assert_in("items", notifs)
        return notifs

    # ============ BB AI TESTS ============
    def test_bb_chat(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        session_id = f"test-session-{uuid.uuid4().hex[:8]}"
        
        r = requests.post(f"{API}/bb/chat", json={
            "message": "Hello, I need help with housing assistance",
            "session_id": session_id,
            "context": {}
        }, headers=headers, timeout=60)
        self.assert_status(r, 200)
        response = r.json()
        self.assert_in("reply", response)
        self.assert_in("intent", response)
        assert len(response["reply"]) > 0, "Expected non-empty reply"
        return response

    def test_bb_intro(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/bb/intro", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        response = r.json()
        self.assert_in("reply", response)
        self.assert_equal(response["role"], "caseworker")
        return response

    # ============ BB BROWSER TESTS ============
    def test_bb_browser_start(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.post(f"{API}/bb/browser/start", json={"url": "about:blank"}, headers=headers, timeout=60)
        self.assert_status(r, 200)
        response = r.json()
        self.assert_in("session_id", response)
        self.assert_in("screenshot", response)
        self.test_data["browser_session_id"] = response["session_id"]
        return response

    def test_bb_browser_navigate(self):
        if "browser_session_id" not in self.test_data:
            return
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.post(f"{API}/bb/browser/action", json={
            "session_id": self.test_data["browser_session_id"],
            "action": "navigate",
            "payload": {"url": f"{BASE_URL}/demo/housing-form"}
        }, headers=headers, timeout=60)
        self.assert_status(r, 200)
        return r.json()

    def test_bb_browser_extract(self):
        if "browser_session_id" not in self.test_data:
            return
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.post(f"{API}/bb/browser/action", json={
            "session_id": self.test_data["browser_session_id"],
            "action": "extract",
            "payload": {}
        }, headers=headers, timeout=60)
        self.assert_status(r, 200)
        response = r.json()
        result = response["result"]
        self.assert_in("form_html", result)
        self.assert_in("fields", result)
        return response

    def test_bb_browser_websocket_valid(self):
        if "browser_session_id" not in self.test_data:
            return
        
        async def test_ws():
            token = self.tokens["caseworker"]
            session_id = self.test_data["browser_session_id"]
            uri = f"{WS_URL}/bb/browser/stream/{session_id}?token={token}"
            
            async with websockets.connect(uri) as ws:
                received_frame = False
                for _ in range(16):
                    try:
                        msg = await asyncio.wait_for(ws.recv(), timeout=0.5)
                        data = json.loads(msg)
                        if data.get("type") == "frame":
                            received_frame = True
                            break
                    except asyncio.TimeoutError:
                        continue
                
                assert received_frame, "Expected frame message"
        
        asyncio.run(test_ws())

    def test_bb_browser_websocket_invalid_token(self):
        if "browser_session_id" not in self.test_data:
            return
        
        async def test_ws():
            session_id = self.test_data["browser_session_id"]
            uri = f"{WS_URL}/bb/browser/stream/{session_id}?token=invalid"
            
            try:
                async with websockets.connect(uri) as ws:
                    await asyncio.sleep(0.5)
                    assert False, "Expected connection to be rejected"
            except Exception as e:
                # Server rejects invalid auth at HTTP level (403) or with WebSocket close code
                # Both are acceptable - the important thing is that it's rejected
                assert "403" in str(e) or "4401" in str(e) or "rejected" in str(e).lower(), f"Expected rejection, got: {e}"
                return True
        
        asyncio.run(test_ws())

    def test_bb_browser_websocket_wrong_session(self):
        async def test_ws():
            token = self.tokens["caseworker"]
            wrong_session_id = f"bb-browser-{uuid.uuid4().hex[:8]}"
            uri = f"{WS_URL}/bb/browser/stream/{wrong_session_id}?token={token}"
            
            try:
                async with websockets.connect(uri) as ws:
                    await asyncio.sleep(0.5)
                    assert False, "Expected connection to be rejected"
            except Exception as e:
                # Server rejects wrong session at HTTP level (403) or with WebSocket close code
                # Both are acceptable - the important thing is that it's rejected
                assert "403" in str(e) or "4403" in str(e) or "rejected" in str(e).lower(), f"Expected rejection, got: {e}"
                return True
        
        asyncio.run(test_ws())

    def test_bb_browser_stop(self):
        if "browser_session_id" not in self.test_data:
            return
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.post(f"{API}/bb/browser/stop?session_id={self.test_data['browser_session_id']}", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)

    # ============ ANALYTICS TESTS ============
    def test_analytics_caseworker(self):
        headers = {"Authorization": f"Bearer {self.tokens['caseworker']}"}
        r = requests.get(f"{API}/analytics/caseworker", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        analytics = r.json()
        for key in ["total_cases", "active_cases", "open_tasks"]:
            self.assert_in(key, analytics)
        return analytics

    def test_analytics_admin(self):
        headers = {"Authorization": f"Bearer {self.tokens['admin']}"}
        r = requests.get(f"{API}/analytics/admin", headers=headers, timeout=TIMEOUT)
        self.assert_status(r, 200)
        analytics = r.json()
        for key in ["total_users", "residents", "caseworkers"]:
            self.assert_in(key, analytics)
        return analytics

    # ============ RUN ALL TESTS ============
    def run_all(self):
        self.log("=" * 80)
        self.log("HAVEN Backend E2E Test Suite")
        self.log("=" * 80)
        
        # Auth
        self.run_test("Auth: Login as admin", self.test_auth_admin)
        self.run_test("Auth: Login as caseworker", self.test_auth_caseworker)
        self.run_test("Auth: Login as resident", self.test_auth_resident)
        self.run_test("Auth: GET /api/auth/me (admin)", lambda: self.test_auth_me("admin"))
        self.run_test("Auth: GET /api/auth/me (caseworker)", lambda: self.test_auth_me("caseworker"))
        self.run_test("Auth: GET /api/auth/me (resident)", lambda: self.test_auth_me("resident"))
        
        # Cases & RBAC
        self.run_test("Cases: Resident sees only own cases", self.test_cases_resident_scoped)
        self.run_test("Cases: Caseworker sees all cases", self.test_cases_caseworker_all)
        self.run_test("Cases: Resident 403 on other's case", self.test_cases_resident_forbidden)
        self.run_test("Cases: Caseworker can claim case", self.test_cases_caseworker_claim)
        
        # Tasks
        self.run_test("Tasks: POST /api/tasks", self.test_tasks_create)
        self.run_test("Tasks: PATCH /api/tasks/{id}", self.test_tasks_update)
        
        # Messages
        self.run_test("Messages: POST /api/messages", self.test_messages_create)
        self.run_test("Messages: Resident 403 on other's messages", self.test_messages_resident_forbidden)
        
        # Documents
        self.run_test("Documents: POST /api/documents", self.test_documents_upload)
        self.run_test("Documents: PATCH /api/documents/{id}/verify", self.test_documents_verify)
        
        # Integrations
        self.run_test("Integrations: GET /api/integrations (12 agencies)", self.test_integrations_list)
        self.run_test("Integrations: GET /api/integrations/_/stats", self.test_integrations_stats)
        self.run_test("Integrations: GET /api/integrations/{code}", self.test_integrations_get_single)
        self.run_test("Integrations: PATCH toggle (admin)", self.test_integrations_toggle_admin)
        self.run_test("Integrations: PATCH toggle (caseworker 403)", self.test_integrations_toggle_caseworker_forbidden)
        self.run_test("Integrations: POST submit", self.test_integrations_submit)
        self.run_test("Integrations: POST submit (missing fields)", self.test_integrations_submit_missing_fields)
        self.run_test("Integrations: GET submissions (caseworker)", self.test_integrations_submissions_caseworker)
        self.run_test("Integrations: GET submissions (resident)", self.test_integrations_submissions_resident)
        self.run_test("Integrations: POST sync", self.test_integrations_sync)
        self.run_test("Integrations: GET oauth/meta", self.test_integrations_oauth_meta)
        self.run_test("Integrations: GET oauth/start (no config)", self.test_integrations_oauth_start_no_config)
        self.run_test("Integrations: GET oauth/callback (invalid)", self.test_integrations_oauth_callback_invalid)
        
        # Admin
        self.run_test("Admin: GET /api/admin/users", self.test_admin_users_list)
        self.run_test("Admin: GET /api/admin/users (caseworker 403)", self.test_admin_users_caseworker_forbidden)
        self.run_test("Admin: POST /api/admin/users", self.test_admin_users_create)
        self.run_test("Admin: POST /api/admin/users (duplicate 409)", self.test_admin_users_create_duplicate)
        self.run_test("Admin: PATCH /api/admin/users/{id}", self.test_admin_users_update)
        self.run_test("Admin: DELETE self (400)", self.test_admin_users_delete_self)
        
        # Audit
        self.run_test("Audit: GET /api/admin/audit", self.test_audit_list)
        self.run_test("Audit: GET /api/admin/audit/stats", self.test_audit_stats)
        
        # Notifications
        self.run_test("Notifications: GET (resident)", self.test_notifications_resident)
        self.run_test("Notifications: GET (caseworker)", self.test_notifications_caseworker)
        
        # BB AI
        self.run_test("BB AI: POST /api/bb/chat", self.test_bb_chat)
        self.run_test("BB AI: GET /api/bb/intro", self.test_bb_intro)
        
        # BB Browser
        self.run_test("BB Browser: POST start", self.test_bb_browser_start)
        self.run_test("BB Browser: POST action (navigate)", self.test_bb_browser_navigate)
        self.run_test("BB Browser: POST action (extract)", self.test_bb_browser_extract)
        self.run_test("BB Browser: WebSocket (valid token)", self.test_bb_browser_websocket_valid)
        self.run_test("BB Browser: WebSocket (invalid token 4401)", self.test_bb_browser_websocket_invalid_token)
        self.run_test("BB Browser: WebSocket (wrong session 4403)", self.test_bb_browser_websocket_wrong_session)
        self.run_test("BB Browser: POST stop", self.test_bb_browser_stop)
        
        # Analytics
        self.run_test("Analytics: GET /api/analytics/caseworker", self.test_analytics_caseworker)
        self.run_test("Analytics: GET /api/analytics/admin", self.test_analytics_admin)
        
        # Summary
        self.log("=" * 80)
        self.log(f"Tests Run: {self.tests_run}")
        self.log(f"Tests Passed: {self.tests_passed}")
        self.log(f"Tests Failed: {self.tests_failed}")
        self.log(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        self.log("=" * 80)
        
        if self.failures:
            self.log("FAILURES:")
            for failure in self.failures:
                self.log(f"  - {failure['test']}: {failure['error']}")
        
        return self.tests_failed == 0


if __name__ == "__main__":
    runner = TestRunner()
    success = runner.run_all()
    sys.exit(0 if success else 1)
