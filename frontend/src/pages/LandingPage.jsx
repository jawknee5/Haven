import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Bot,
  HeartHandshake,
  Calendar,
  FileSpreadsheet,
  LifeBuoy,
} from "lucide-react";

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/4fc92d65-c570-4db2-ba8f-79868bee5a71/images/bdc736d2b200bf609f639d0bda1a42b9b26ef88060109b091b7cbbf15e0698e0.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen text-zinc-100">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-[var(--haven-border)] bg-[#0c0c0e]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="landing-logo">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center font-display font-bold text-white shadow-lg shadow-blue-500/20">H</div>
            <span className="font-display font-semibold tracking-tight text-lg">HAVEN</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-300">
            <a href="#mission" className="hover:text-white" data-testid="nav-mission">Mission</a>
            <a href="#how" className="hover:text-white" data-testid="nav-how">How it works</a>
            <a href="#bb" className="hover:text-white" data-testid="nav-bb">Meet BB</a>
            <Link to="/resources" className="hover:text-white" data-testid="nav-resources">Resources</Link>
            <Link to="/book" className="hover:text-white" data-testid="nav-book">Book</Link>
            <Link to="/crisis" className="hover:text-rose-300" data-testid="nav-crisis">Crisis</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              data-testid="landing-signin-btn"
              className="haven-btn text-sm font-medium px-4 py-2 rounded-full border border-zinc-700/70 hover:bg-zinc-800/60"
            >
              Sign in
            </Link>
            <Link
              to="/login?mode=register"
              data-testid="landing-getstarted-btn"
              className="haven-btn text-sm font-medium px-4 py-2 rounded-full bg-blue-500 hover:bg-blue-400 text-white haven-glow-primary"
            >
              Get support
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-[0.42]"
          style={{
            backgroundImage: `url(${HERO_IMG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 90%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 90%)",
          }}
        />
        <div className="absolute inset-0 -z-10 haven-grid-bg opacity-30" />
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-28">
          <div className="max-w-3xl">
            <p
              data-testid="hero-overline"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-blue-300/90 border border-blue-500/30 bg-blue-500/10 rounded-full px-3 py-1"
            >
              <Sparkles size={12} /> Helping Agencies, Volunteers, and Everyone Navigate
            </p>
            <h1
              data-testid="hero-headline"
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter mt-6 leading-[0.96]"
            >
              Help has a <span className="bg-gradient-to-br from-blue-400 to-emerald-300 bg-clip-text text-transparent">home</span>.
            </h1>
            <p data-testid="hero-sub" className="mt-6 text-lg text-zinc-300 leading-relaxed max-w-2xl">
              HAVEN is a modern civic platform that unifies housing, food, health, benefits, and crisis support into one calm, dignified place — for residents, caseworkers, agencies, and volunteers.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/login?mode=register"
                data-testid="hero-cta-primary"
                className="haven-btn group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-medium haven-glow-primary"
              >
                Get support <ArrowRight size={16} className="group-hover:translate-x-0.5 transition" />
              </Link>
              <Link
                to="/resources"
                data-testid="hero-cta-secondary"
                className="haven-btn inline-flex items-center gap-2 px-6 py-3 rounded-full border border-zinc-700/70 hover:bg-zinc-800/60 text-zinc-100 font-medium"
              >
                Explore resources
              </Link>
              <Link
                to="/book"
                data-testid="hero-cta-tertiary"
                className="haven-btn inline-flex items-center gap-2 px-6 py-3 rounded-full text-zinc-300 hover:text-white"
              >
                <Calendar size={16} /> Book a session
              </Link>
            </div>
            <p className="mt-6 text-xs text-zinc-500 max-w-xl">
              Free. Private. Built for dignity. The first thing you should feel here is <span className="text-emerald-300/90">relief</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Stat strip */}
      <section className="border-y border-[var(--haven-border)] bg-[#0d0d10]/70">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { k: "1", v: "Place for everything" },
            { k: "24/7", v: "BB always on" },
            { k: "0", v: "Cost to residents" },
            { k: "100%", v: "Dignity-first" },
          ].map((s) => (
            <div key={s.v}>
              <p className="font-display text-3xl font-semibold text-zinc-50">{s.k}</p>
              <p className="text-xs text-zinc-500 mt-1 tracking-wide">{s.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400">The Mission</p>
            <h2 className="font-display text-4xl font-semibold tracking-tight mt-3">Getting help shouldn't feel impossible.</h2>
            <p className="text-zinc-400 mt-4 leading-relaxed">
              Residents face confusing systems, long forms, repeated questions, and unclear eligibility rules. Agencies face overwhelming workloads, scattered tools, and constant follow-ups. HAVEN fixes both — at once.
            </p>
          </div>
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            {[
              { icon: HeartHandshake, t: "For Residents", d: "Clear steps, plain language, one place to track everything." },
              { icon: ShieldCheck, t: "For Agencies", d: "Less paperwork, better coordination, real-time visibility." },
              { icon: Bot, t: "Powered by BB", d: "AI that fills forms, drafts messages, and catches what you miss." },
              { icon: MapPin, t: "Live Map", d: "Real-time view of shelter, food, health, and crisis resources." },
            ].map((c) => (
              <div key={c.t} className="haven-card p-6">
                <c.icon size={20} className="text-blue-300" />
                <h3 className="font-display font-medium mt-3">{c.t}</h3>
                <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BB feature */}
      <section id="bb" className="border-t border-[var(--haven-border)] bg-[#0b0b0e]">
        <div className="max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400">Meet BB</p>
            <h2 className="font-display text-4xl font-semibold tracking-tight mt-3">An AI that actually fills the form for you.</h2>
            <p className="text-zinc-400 mt-4 leading-relaxed">
              BB is HAVEN's intelligent assistant. She chats with you, understands what you need, watches your screen with permission, and can drive a real headless browser to fill agency forms on your behalf. For caseworkers, she eliminates the busywork. For residents, she removes the maze.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {["Multi-turn chat", "Crisis detection", "Form auto-fill", "Live screen view", "Browser control", "Application tracking"].map(
                (f) => (
                  <div key={f} className="haven-card px-3 py-2 text-zinc-300 text-xs">
                    {f}
                  </div>
                )
              )}
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="haven-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-white" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)" }}>
                  BB
                </div>
                <div>
                  <p className="text-sm font-medium">BB</p>
                  <p className="text-[11px] text-zinc-500">Claude Sonnet 4.5 · Civic Support</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] ml-auto text-blue-50">
                  I have an eviction notice. 5 days. Two kids. What do I do?
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-zinc-100 leading-relaxed">
                  You're going to be okay. I'm logging this as urgent and routing you to legal aid for emergency eviction defense — they can stop the lockout. I'll also start a Section 8 application with you right now, and I'll fill the form for you. Ready?
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] ml-auto text-blue-50">
                  Yes please.
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-zinc-100 leading-relaxed">
                  Opening the housing portal in my browser… analyzing fields… mapping your profile… filling 11 of 14 fields. 3 need your confirmation. <span className="text-emerald-300">Done — review and submit.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-24">
        <p className="text-[10px] uppercase tracking-[0.22em] font-semibold text-blue-400">How it works</p>
        <h2 className="font-display text-4xl font-semibold tracking-tight mt-3 max-w-2xl">Four steps. No maze.</h2>
        <div className="mt-10 grid md:grid-cols-4 gap-4">
          {[
            { n: "01", t: "Tell us what's going on", d: "Plain-language intake. No jargon, no judgment." },
            { n: "02", t: "Get matched", d: "We route you to the right programs and people." },
            { n: "03", t: "Follow your roadmap", d: "Clear steps. Real progress. Real-time updates." },
            { n: "04", t: "Stay connected", d: "Messages, reminders, and BB at your side 24/7." },
          ].map((s) => (
            <div key={s.n} className="haven-card p-6">
              <p className="font-mono text-xs text-blue-300/80">{s.n}</p>
              <h3 className="font-display font-medium mt-2">{s.t}</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--haven-border)]">
        <div className="max-w-5xl mx-auto px-6 py-24 text-center">
          <h2 className="font-display text-5xl font-semibold tracking-tighter">
            Help has a home — and it starts here.
          </h2>
          <p className="text-zinc-400 mt-5 max-w-xl mx-auto">
            Free for residents. Built for the people doing the work. Trusted by communities.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/login?mode=register"
              data-testid="footer-cta-primary"
              className="haven-btn px-6 py-3 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-medium haven-glow-primary inline-flex items-center gap-2"
            >
              Get started <ArrowRight size={16} />
            </Link>
            <Link
              to="/book"
              data-testid="footer-cta-book"
              className="haven-btn px-6 py-3 rounded-full border border-zinc-700/70 hover:bg-zinc-800/60 inline-flex items-center gap-2"
            >
              <Calendar size={16} /> Book a session
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--haven-border)]">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} HAVEN™ · Help has a home.</p>
          <div className="flex items-center gap-5">
            <Link to="/crisis" className="hover:text-rose-300 inline-flex items-center gap-1"><LifeBuoy size={12} /> Crisis support</Link>
            <Link to="/resources" className="hover:text-zinc-200">Resources</Link>
            <Link to="/book" className="hover:text-zinc-200">Book a session</Link>
            <Link to="/login" className="hover:text-zinc-200">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
