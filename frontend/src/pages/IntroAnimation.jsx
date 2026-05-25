import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * HAVEN Intro Cinematic
 *
 * Sequence (timings in ms from start):
 *   0     → 2400  : "Stability Starts Here" — silver glistening, fade in L→R, hold, fade out L→R
 *   2400  → 4400  : Bird only fades in from center
 *   3600  → 5200  : "Help has a home." gold glistening fades in under the bird
 *   5200  → 8200  : Hold (3 seconds)
 *   8200  → 9000  : Bird + tagline fade out
 *   9000  → 12500 : Full HAVEN logo fades in dramatically under (previously-blank) bird position
 *   12500 → 16500 : Hold 4 seconds (intentional dramatic dwell)
 *   16500         : Navigate to login
 *
 * If user already authed, we redirect to their dashboard.
 * "Skip intro" available — accessibility-respectful and respects prefers-reduced-motion.
 */
export default function IntroAnimation() {
  const [phase, setPhase] = useState("stability"); // stability | birdOnly | full | done
  const [skipped, setSkipped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If user has token, skip intro
    const token = localStorage.getItem("haven_token");
    const user = localStorage.getItem("haven_user");
    if (token && user) {
      try {
        const u = JSON.parse(user);
        navigate(`/${u.role}`, { replace: true });
        return;
      } catch {}
    }

    // Respect reduced motion: skip intro
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      navigate("/login", { replace: true });
      return;
    }

    const seenRecently = sessionStorage.getItem("haven_intro_seen");
    if (seenRecently) {
      navigate("/login", { replace: true });
      return;
    }

    const timers = [];
    timers.push(setTimeout(() => setPhase("birdOnly"), 2400));
    timers.push(setTimeout(() => setPhase("full"), 9000));
    timers.push(
      setTimeout(() => {
        sessionStorage.setItem("haven_intro_seen", "1");
        navigate("/login", { replace: true });
      }, 16500)
    );
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  function skip() {
    setSkipped(true);
    sessionStorage.setItem("haven_intro_seen", "1");
    setTimeout(() => navigate("/login", { replace: true }), 250);
  }

  return (
    <div className={`haven-intro ${skipped ? "haven-intro-fading" : ""}`}>
      {/* Starry / depth backdrop */}
      <div className="intro-bg" />
      <div className="intro-vignette" />

      {/* Skip button */}
      <button
        data-testid="skip-intro-btn"
        onClick={skip}
        className="intro-skip"
        aria-label="Skip intro"
      >
        Skip intro →
      </button>

      {/* Phase 1: "Stability Starts Here" silver shimmer left→right */}
      <div className={`stage stage-stability ${phase === "stability" ? "is-active" : "is-out"}`}>
        <h1 className="silver-shimmer">
          {"Stability Starts Here".split("").map((c, i) => (
            <span key={i} style={{ animationDelay: `${i * 60}ms` }}>
              {c === " " ? "\u00A0" : c}
            </span>
          ))}
        </h1>
      </div>

      {/* Phase 2: Bird only */}
      <div
        className={`stage stage-bird ${
          phase === "birdOnly" ? "is-active" : phase === "full" ? "is-fading" : "is-out"
        }`}
      >
        <img
          src="/haven-bird.png"
          alt="HAVEN dove"
          className="bird-only"
          data-testid="intro-bird-only"
        />
        <h2 className="gold-shimmer help-tag">
          {"Help has a home.".split("").map((c, i) => (
            <span key={i} style={{ animationDelay: `${800 + i * 55}ms` }}>
              {c === " " ? "\u00A0" : c}
            </span>
          ))}
        </h2>
      </div>

      {/* Phase 3: Full logo dramatic */}
      <div className={`stage stage-full ${phase === "full" ? "is-active" : "is-out"}`}>
        <img
          src="/haven-logo.png"
          alt="HAVEN — Helping Agencies, Volunteers, and Everyone Navigate"
          className="full-logo"
          data-testid="intro-full-logo"
        />
      </div>
    </div>
  );
}
