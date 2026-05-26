import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * HAVEN Login Intro Cinematic — the most important first impression.
 *
 * Silver phase (Phase 1) — the user's required pacing:
 *   0      → 2500   : "Stability Starts Here" SLOWLY fades in to fully readable
 *   2500   → 6500   : HOLD 4 seconds at full readability (silver glimmer drifts L→R)
 *   6500   → 9000   : SLOWLY fades out
 *
 * Bird phase (Phase 2) — overlaps from 8000 for a seamless handoff:
 *   8000   → 10000  : Bird halo blooms; bird rises from soft blur into focus
 *   9100   → 12300  : "Help has a home." gold tagline shimmers in beneath the bird
 *   12300  → 15000  : Hold (bird floats gently, halo pulses)
 *   15000  → 16200  : Bird + tagline fade away
 *
 * Logo finale (Phase 3) — overlaps from 15000:
 *   15000  → 18000  : Full HAVEN logo dramatic reveal (blur → focus, glow blooms)
 *   17500  → 19500  : Acronym "Helping · Agencies · Volunteers · & Everyone · Navigate"
 *   19500  → 24000  : Hold — ~4.5s dramatic dwell on the full logo
 *   24000           : onDone fires → login form gracefully fades in
 *
 * Total ~24 seconds. Every American deserves to feel this in full.
 */
export default function IntroAnimation({ onDone, autoNavigate = false }) {
  const [phase, setPhase] = useState("stability"); // stability | birdOnly | full | done
  const [skipped, setSkipped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Respect reduced motion: instantly finish
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      finish(true);
      return;
    }

    const timers = [];
    timers.push(setTimeout(() => setPhase("birdOnly"), 8000));   // bird rises while silver fades out
    timers.push(setTimeout(() => setPhase("full"), 15000));      // logo dramatic finale
    timers.push(setTimeout(() => finish(false), 24000));         // done
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish(instant) {
    setSkipped(true);
    const delay = instant ? 0 : 600;
    setTimeout(() => {
      if (onDone) onDone();
      else if (autoNavigate) navigate("/login", { replace: true });
    }, delay);
  }

  function skip() {
    finish(true);
  }

  return (
    <div className={`haven-intro ${skipped ? "haven-intro-fading" : ""}`} data-testid="haven-intro">
      <div className="intro-bg" />
      <div className="intro-stars" />
      <div className="intro-vignette" />

      <button
        data-testid="skip-intro-btn"
        onClick={skip}
        className="intro-skip"
        aria-label="Skip intro"
      >
        Skip intro →
      </button>

      {/* Phase 1: "Stability Starts Here" — slow silver fade-in → 4s readable hold → slow fade-out */}
      <div className={`stage stage-stability ${phase === "stability" ? "is-active" : "is-out"}`}>
        <h1 className="silver-shimmer" data-testid="intro-stability">
          {/* No per-letter stagger — the phrase fades in as a whole for readability,
              then a silver glimmer drifts across during the 4-second hold. */}
          <span>{"Stability Starts Here."}</span>
        </h1>
      </div>

      {/* Phase 2: Bird with halo + "Help has a home." */}
      <div
        className={`stage stage-bird ${
          phase === "birdOnly" ? "is-active" : phase === "full" ? "is-fading" : "is-out"
        }`}
      >
        {phase === "birdOnly" && <div className="bird-halo" aria-hidden="true" />}
        <img
          src="/haven-bird.png"
          alt="HAVEN dove"
          className="bird-only"
          data-testid="intro-bird-only"
        />
        <h2 className="gold-shimmer help-tag">
          {"Help has a home.".split("").map((c, i) => (
            <span key={i} style={{ animationDelay: `${1100 + i * 70}ms` }}>
              {c === " " ? "\u00A0" : c}
            </span>
          ))}
        </h2>
      </div>

      {/* Phase 3: Full HAVEN logo dramatic finale */}
      <div className={`stage stage-full ${phase === "full" ? "is-active" : "is-out"}`}>
        <div className="full-logo-wrap">
          <div className="full-logo-glow" aria-hidden="true" />
          <img
            src="/haven-logo.png"
            alt="HAVEN — Helping Agencies, Volunteers, and Everyone Navigate"
            className="full-logo"
            data-testid="intro-full-logo"
          />
        </div>
        <p className="full-logo-acronym" data-testid="intro-acronym">
          Helping&nbsp;&middot;&nbsp;Agencies&nbsp;&middot;&nbsp;Volunteers&nbsp;&middot;&nbsp;&amp;&nbsp;Everyone&nbsp;&middot;&nbsp;Navigate
        </p>
      </div>
    </div>
  );
}
