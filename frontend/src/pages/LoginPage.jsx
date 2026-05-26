import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Loader2, ArrowLeft } from "lucide-react";

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
  const { login, register } = useAuth();

  async function handleSubmit(e) {
    e?.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const user =
        mode === "login"
          ? await login(email, password)
          : await register({ email, password, name, role });
      navigate(`/${user.role}`);
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 py-5 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2 text-[#aab5cf] hover:text-[#f1d36b] text-sm">
          <ArrowLeft size={14} /> Back home
        </Link>
        <Link to="/home" className="flex items-center gap-2" data-testid="login-logo">
          <img src="/haven-bird.png" alt="HAVEN" className="h-8 w-auto" />
          <span className="font-serif-haven font-semibold tracking-[0.18em] text-gold">HAVEN</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#d4af37] text-center">Help has a home.</p>
          <h1 className="font-serif-haven text-3xl font-semibold tracking-tight text-center mt-2">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-[#aab5cf] text-center mt-2">
            {mode === "login" ? "Sign in to continue." : "It's free and takes a minute."}
          </p>

          <form onSubmit={handleSubmit} className="haven-card p-6 mt-6 space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="text-xs text-[#aab5cf]">Full name</label>
                  <input
                    data-testid="register-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 w-full bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]/60"
                    placeholder="First Last"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#aab5cf]">I am a…</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {["resident", "caseworker", "admin"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        data-testid={`role-${r}`}
                        onClick={() => setRole(r)}
                        className={`haven-btn text-xs py-2 rounded-lg capitalize border ${
                          role === r ? "bg-[#d4af37]/15 border-[#d4af37]/40 text-[#f1d36b]" : "border-[#1d2c4f] text-[#aab5cf] hover:bg-[#142244]/50"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="text-xs text-[#aab5cf]">Email</label>
              <input
                data-testid="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]/60"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs text-[#aab5cf]">Password</label>
              <input
                data-testid="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 w-full bg-[#0a142b]/70 border border-[#1d2c4f] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d4af37]/60"
                placeholder="••••••••"
              />
            </div>

            {err && <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{err}</p>}

            <button
              data-testid="login-submit-btn"
              type="submit"
              disabled={busy}
              className="haven-btn w-full py-2.5 rounded-lg btn-gold haven-glow-gold flex items-center justify-center gap-2"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>

            <button
              data-testid="toggle-mode-btn"
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-xs text-[#aab5cf] hover:text-[#f1d36b] w-full text-center"
            >
              {mode === "login" ? "Need an account? Register" : "Have an account? Sign in"}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-[#6d7a9a] text-center mb-3">Demo accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.label}
                  data-testid={`demo-login-${a.label.toLowerCase()}`}
                  onClick={() => loginAs(a)}
                  disabled={busy}
                  className="haven-btn text-xs py-2 rounded-lg border border-[#1d2c4f] hover:bg-[#142244]/50 hover:border-[#d4af37]/40 disabled:opacity-50"
                >
                  {a.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[#6d7a9a] text-center mt-2">All demo passwords: <span className="font-mono text-[#d4af37]/80">Demo2026!</span></p>
          </div>
        </div>
      </main>
    </div>
  );
}
