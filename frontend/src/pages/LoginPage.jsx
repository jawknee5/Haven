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
        <Link to="/" className="flex items-center gap-2 text-zinc-300 hover:text-white text-sm">
          <ArrowLeft size={14} /> Back home
        </Link>
        <Link to="/" className="flex items-center gap-2" data-testid="login-logo">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center font-display font-bold text-white">H</div>
          <span className="font-display font-semibold tracking-tight">HAVEN</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400 text-center">Help has a home.</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-center mt-2">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-zinc-400 text-center mt-2">
            {mode === "login" ? "Sign in to continue." : "It's free and takes a minute."}
          </p>

          <form onSubmit={handleSubmit} className="haven-card p-6 mt-6 space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="text-xs text-zinc-400">Full name</label>
                  <input
                    data-testid="register-name-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 w-full bg-zinc-900/70 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/60"
                    placeholder="First Last"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">I am a…</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {["resident", "caseworker", "admin"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        data-testid={`role-${r}`}
                        onClick={() => setRole(r)}
                        className={`haven-btn text-xs py-2 rounded-lg capitalize border ${
                          role === r ? "bg-blue-500/15 border-blue-500/40 text-blue-200" : "border-zinc-700/60 text-zinc-300 hover:bg-zinc-800/50"
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
              <label className="text-xs text-zinc-400">Email</label>
              <input
                data-testid="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full bg-zinc-900/70 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/60"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400">Password</label>
              <input
                data-testid="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 w-full bg-zinc-900/70 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500/60"
                placeholder="••••••••"
              />
            </div>

            {err && <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{err}</p>}

            <button
              data-testid="login-submit-btn"
              type="submit"
              disabled={busy}
              className="haven-btn w-full py-2.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-medium flex items-center justify-center gap-2"
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>

            <button
              data-testid="toggle-mode-btn"
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-xs text-zinc-400 hover:text-zinc-200 w-full text-center"
            >
              {mode === "login" ? "Need an account? Register" : "Have an account? Sign in"}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-zinc-500 text-center mb-3">Demo accounts</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((a) => (
                <button
                  key={a.label}
                  data-testid={`demo-login-${a.label.toLowerCase()}`}
                  onClick={() => loginAs(a)}
                  disabled={busy}
                  className="haven-btn text-xs py-2 rounded-lg border border-zinc-700/60 hover:bg-zinc-800/50 disabled:opacity-50"
                >
                  {a.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-600 text-center mt-2">All demo passwords: <span className="font-mono">Demo2026!</span></p>
          </div>
        </div>
      </main>
    </div>
  );
}
