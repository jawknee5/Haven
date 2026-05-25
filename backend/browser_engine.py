"""Playwright-backed headless browser engine for BB's Browser Control feature.

Each BB browser session owns a Playwright Browser + Page. We provide:
- start: launch chromium, navigate to URL, return screenshot
- action: navigate / fill / click / type / submit / extract / scroll / back / forward / screenshot
- stop: cleanly tear down

We keep sessions in-memory keyed by session_id. For an investor-grade demo this is
sufficient. In production we'd put a session manager + TTL on top.
"""
from __future__ import annotations

import asyncio
import base64
import os
from typing import Optional

from playwright.async_api import Browser, BrowserContext, Page, async_playwright

os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/pw-browsers")


class BrowserSession:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.playwright = None
        self.browser: Optional[Browser] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.lock = asyncio.Lock()

    async def start(self, url: str = "about:blank") -> None:
        if self.browser is not None:
            return
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
            ],
        )
        self.context = await self.browser.new_context(
            viewport={"width": 1280, "height": 800},
            user_agent=(
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
            ),
        )
        self.page = await self.context.new_page()
        if url and url != "about:blank":
            try:
                await self.page.goto(url, wait_until="domcontentloaded", timeout=20000)
            except Exception:
                # ignore navigation timeouts so the session still starts
                pass

    async def screenshot(self) -> str:
        """Return base64-encoded JPEG screenshot of current page."""
        if not self.page:
            return ""
        try:
            buf = await self.page.screenshot(type="jpeg", quality=70, full_page=False)
            return base64.b64encode(buf).decode("ascii")
        except Exception:
            return ""

    async def url(self) -> str:
        if not self.page:
            return ""
        return self.page.url

    async def title(self) -> str:
        if not self.page:
            return ""
        try:
            return await self.page.title()
        except Exception:
            return ""

    async def navigate(self, url: str) -> dict:
        if not self.page:
            await self.start(url)
        else:
            try:
                await self.page.goto(url, wait_until="domcontentloaded", timeout=20000)
            except Exception as e:
                return {"ok": False, "error": str(e)[:200]}
        return {"ok": True}

    async def back(self) -> dict:
        if not self.page:
            return {"ok": False, "error": "no page"}
        try:
            await self.page.go_back(wait_until="domcontentloaded", timeout=10000)
            return {"ok": True}
        except Exception as e:
            return {"ok": False, "error": str(e)[:200]}

    async def forward(self) -> dict:
        if not self.page:
            return {"ok": False, "error": "no page"}
        try:
            await self.page.go_forward(wait_until="domcontentloaded", timeout=10000)
            return {"ok": True}
        except Exception as e:
            return {"ok": False, "error": str(e)[:200]}

    async def scroll(self, dy: int = 400) -> dict:
        if not self.page:
            return {"ok": False, "error": "no page"}
        try:
            await self.page.evaluate(f"window.scrollBy(0, {int(dy)})")
            return {"ok": True}
        except Exception as e:
            return {"ok": False, "error": str(e)[:200]}

    async def fill(self, selector: str, value: str) -> dict:
        if not self.page:
            return {"ok": False, "error": "no page"}
        try:
            await self.page.fill(selector, value, timeout=5000)
            return {"ok": True}
        except Exception as e:
            return {"ok": False, "error": str(e)[:200]}

    async def click(self, selector: str) -> dict:
        if not self.page:
            return {"ok": False, "error": "no page"}
        try:
            await self.page.click(selector, timeout=5000)
            return {"ok": True}
        except Exception as e:
            return {"ok": False, "error": str(e)[:200]}

    async def type_text(self, selector: str, text: str, delay: int = 30) -> dict:
        if not self.page:
            return {"ok": False, "error": "no page"}
        try:
            await self.page.type(selector, text, delay=delay, timeout=5000)
            return {"ok": True}
        except Exception as e:
            return {"ok": False, "error": str(e)[:200]}

    async def submit(self, selector: Optional[str] = None) -> dict:
        if not self.page:
            return {"ok": False, "error": "no page"}
        try:
            if selector:
                await self.page.click(selector, timeout=5000)
            else:
                await self.page.evaluate(
                    "document.querySelector('form')?.submit()"
                )
            return {"ok": True}
        except Exception as e:
            return {"ok": False, "error": str(e)[:200]}

    async def extract_form_html(self) -> str:
        if not self.page:
            return ""
        try:
            html = await self.page.evaluate(
                """() => {
                    const f = document.querySelector('form');
                    return f ? f.outerHTML : document.body.innerHTML;
                }"""
            )
            return html or ""
        except Exception:
            return ""

    async def extract_form_fields(self) -> list[dict]:
        """Discover fields on the live page using the real DOM."""
        if not self.page:
            return []
        try:
            fields = await self.page.evaluate(
                """() => {
                    const out = [];
                    const els = document.querySelectorAll('input, textarea, select');
                    els.forEach((el, idx) => {
                        const tag = el.tagName.toLowerCase();
                        const type = (el.type || tag).toLowerCase();
                        if (['submit','button','hidden','reset','image'].includes(type)) return;
                        let label = '';
                        if (el.id) {
                            const lab = document.querySelector(`label[for="${el.id}"]`);
                            if (lab) label = lab.innerText.trim();
                        }
                        if (!label && el.closest('label')) {
                            label = el.closest('label').innerText.trim();
                        }
                        let selector = '';
                        if (el.id) {
                            selector = `#${el.id}`;
                        } else if (el.name) {
                            selector = `${tag}[name="${el.name}"]`;
                        } else {
                            selector = `${tag}:nth-of-type(${idx + 1})`;
                        }
                        out.push({
                            type, tag,
                            name: el.name || '',
                            id: el.id || '',
                            placeholder: el.placeholder || '',
                            label,
                            required: !!el.required,
                            selector,
                        });
                    });
                    return out;
                }"""
            )
            return fields or []
        except Exception:
            return []

    async def stop(self) -> None:
        try:
            if self.page:
                await self.page.close()
        except Exception:
            pass
        try:
            if self.context:
                await self.context.close()
        except Exception:
            pass
        try:
            if self.browser:
                await self.browser.close()
        except Exception:
            pass
        try:
            if self.playwright:
                await self.playwright.stop()
        except Exception:
            pass
        self.page = self.context = self.browser = self.playwright = None


# In-memory session registry
_sessions: dict[str, BrowserSession] = {}


async def get_or_create_session(session_id: str, url: str = "about:blank") -> BrowserSession:
    sess = _sessions.get(session_id)
    if sess is None:
        sess = BrowserSession(session_id)
        _sessions[session_id] = sess
    if sess.browser is None:
        await sess.start(url)
    return sess


def get_session(session_id: str) -> Optional[BrowserSession]:
    return _sessions.get(session_id)


async def close_session(session_id: str) -> None:
    sess = _sessions.pop(session_id, None)
    if sess:
        await sess.stop()


async def close_all_sessions() -> None:
    for sid in list(_sessions.keys()):
        await close_session(sid)


def list_sessions() -> list[str]:
    return list(_sessions.keys())
