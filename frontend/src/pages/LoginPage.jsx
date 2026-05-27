import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Loader2, ArrowLeft } from "lucide-react";
import IntroAnimation from "@/pages/IntroAnimation";

const DEMO_ACCOUNTS = [
  { label: "Caseworker", email: "caseworker@haven.demo", password: "Demo2026!" },
  { label: "Resident", email: "resident@haven.demo", password: "Demo2026!" },
  { label: "Admin", email: "admin@haven.demo", password: "Demo2026!" },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("resident");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, register, user } = useAuth();

  // Intro plays on the login screen — the most critical first impression.
  // Only skip if user is already authenticated, came from "?skipIntro=1", or has seen it this session.
  const skipIntroParam = params.get("skipIntro") === "1";
  const seenThisSession = typeof window !== "undefined" && sessionStorage.getItem("haven_intro_seen") === "1";
  const [showIntro, setShowIntro] = useState(!user && !skipIntroParam && !seenThisSession);

  useEffect(() => {
    if (user) navigate(`/${user.role}`, { replace: true });
  }, [user, navigate]);

  function handleIntroDone() {
    try { sessionStorage.setItem("haven_intro_seen", "1"); } catch (e) {}
    setShowIntro(false);
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const u =
        mode === "login"
          ? await login(email, password)
          : await register({ email, password, name, role });
      navigate(`/${u.role}`);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function loginAs(acc) {
    setEmail(acc.email);
    setPassword(acc.password);
    setErr("");
    setBusy(true);
    try {
      const u = await login(acc.email, acc.password);
      navigate(`/${u.role}`);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  if (showIntro) {
    return <IntroAnimation onDone={handleIntroDone} />;
  }

  return (
    <div className="min-h-screen bg-[var(--haven-bg)] text-[var(--haven-text)] flex flex-col login-fade-in relative overflow-hidden">
      {/* Subtle starfield carried over from intro for visual continuity */}
      <div className="intro-bg pointer-events-none fixed inset-0 opacity-60" />
      <div className="intro-stars pointer-events-none fixed inset-0 opacity-50" />

      {/* Soft golden glow behind the logo column */}
      <div
        className="pointer-events-none fixed left-0 top-0 bottom-0 w-1/2 hidden lg:block"
        style={{
          background:
            "radial-gradient(ellipse at 35% 50%, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.04) 35%, transparent 65%)",
        }}
      />

      <header className="px-6 py-4 flex items-center justify-between relative z-10">
        <Link
          to="/home"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-200 transition haven-btn"
        >
          <ArrowLeft size={14} /> Home
        </Link>
        <Link to="/?skipIntro=0" onClick={() => sessionStorage.removeItem("haven_intro_seen")} className="text-xs text-zinc-500 hover:text-[#f1d36b] transition">
          Replay intro
        </Link>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 px-6 lg:px-16 py-6 lg:py-10 relative z-10 items-center max-w-[1600px] w-full mx-auto">
        {/* LEFT — big HAVEN logo + tagline (centered column on every viewport) */}
        <section className="flex flex-col items-center justify-center text-center login-logo-col">
          <div className="relative w-full max-w-[780px] mx-auto">
            <div
              className="absolute inset-[-12%] pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.08) 35%, transparent 70%)",
                filter: "blur(28px)",
              }}
            />
            <img
              src="/haven-logo.png"
              alt="HAVEN — Helping Agencies, Volunteers, and Everyone Navigate"
              className="relative w-full h-auto drop-shadow-[0_28px_72px_rgba(212,175,55,0.38)]"
              data-testid="login-haven-logo"
            />
          </div>
          <p className="mt-8 text-[10px] uppercase tracking-[0.42em] text-[#d4af37]/85">
            Helping &middot; Agencies &middot; Volunteers &middot; &amp; Everyone &middot; Navigate
          </p>
          <p className="mt-3 font-display italic text-2xl sm:text-3xl text-[#f1d36b]/90 max-w-md">
            Help has a home.
          </p>
          <p className="mt-4 text-sm text-[#aab5cf] max-w-md leading-relaxed hidden lg:block">
            Stability starts here. Sign in to continue your case, connect with your caseworker, and
            track every application across federal, state, and county agencies.
          </p>
        </section>

        {/* RIGHT — login form */}
        <section className="flex justify-center lg:justify-start">
          <div className="w-full max-w-md">
            <div className="haven-card p-6 sm:p-8 backdrop-blur-xl bg-[#070f1d]/85">
              <div className="flex border-b border-[var(--haven-border)] mb-5">
                <button
                  data-testid="tab-login"
                  onClick={() => setMode("login")}
                  className={`flex-1 py-2 text-sm font-medium transition haven-btn ${mode === "login" ? "text-[#f1d36b] border-b-2 border-[#d4af37]" : "text-zinc-500"}`}
                >Sign in</button>
                <button
                  data-testid="tab-register"
                  onClick={() => setMode("register")}
                  className={`flex-1 py-2 text-sm font-medium transition haven-btn ${mode === "register" ? "text-[#f1d36b] border-b-2 border-[#d4af37]" : "text-zinc-500"}`}
                >Create account</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === "register" && (
                  <>
                    <input
                      data-testid="name-input"
                      required
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#d4af37]/60"
                    />
                    <select
                      data-testid="role-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#d4af37]/60"
                    >
                      <option value="resident">I'm a resident seeking help</option>
                      <option value="caseworker">I'm a caseworker</option>
                    </select>
                  </>
                )}
                <input
                  data-testid="email-input"
                  required
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#d4af37]/60"
                />
                <input
                  data-testid="password-input"
                  required
                  type="password"
                  placeholder="Password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#d4af37]/60"
                />
                {err && <p data-testid="login-error" className="text-xs text-rose-400">{err}</p>}
                <button
                  data-testid="submit-btn"
                  type="submit"
                  disabled={busy}
                  className="haven-btn btn-gold w-full rounded-full py-2.5 text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {busy && <Loader2 size={14} className="animate-spin" />}
                  {mode === "login" ? "Sign in" : "Create account"}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[var(--haven-border)]">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#aab5cf] mb-3 text-center">
                  Demo accounts — one click
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      data-testid={`demo-${acc.label.toLowerCase()}`}
                      onClick={() => loginAs(acc)}
                      disabled={busy}
                      className="haven-btn btn-outline-navy text-xs rounded-full py-1.5 disabled:opacity-50"
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500 mt-3 text-center">
                  Password for all demos: <span className="font-mono">Demo2026!</span>
                </p>
              </div>
            </div>

            <p className="text-center text-[11px] text-zinc-500 mt-6">
              Helping Agencies, Volunteers, and Everyone Navigate
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
