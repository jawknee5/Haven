import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const u = localStorage.getItem("haven_user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("haven_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => {
        setUser(r.data);
        localStorage.setItem("haven_user", JSON.stringify(r.data));
      })
      .catch(() => {
        localStorage.removeItem("haven_token");
        localStorage.removeItem("haven_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem("haven_token", r.data.token);
    localStorage.setItem("haven_user", JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  }

  async function register(payload) {
    const r = await api.post("/auth/register", payload);
    localStorage.setItem("haven_token", r.data.token);
    localStorage.setItem("haven_user", JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  }

  function logout() {
    localStorage.removeItem("haven_token");
    localStorage.removeItem("haven_user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
