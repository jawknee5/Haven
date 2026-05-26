import React from "react";

/** Reusable small bird mark — placed in every authed page header + landing. */
export default function BirdMark({ size = 28, className = "" }) {
  return (
    <img
      src="/haven-bird.png"
      alt="HAVEN"
      className={`haven-bird-mark ${className}`}
      style={{ height: size, width: "auto" }}
      data-testid="bird-mark"
    />
  );
}
