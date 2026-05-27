import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// NOTE: StrictMode disabled in dev — Leaflet maps don't survive double-mounting,
// and our auth+browser-engine flows are intentionally single-mount.
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
