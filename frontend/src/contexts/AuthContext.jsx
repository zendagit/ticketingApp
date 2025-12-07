import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("auth_token") || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  async function login(email, password) {
    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });
      if (res.data && res.data.status) {
        const t = res.data.token;
        setToken(t);
        setUser(res.data.user || null);
        return { ok: true, data: res.data };
      }
      return { ok: false, error: res.data || "Unknown error" };
    } catch (err) {
      const message = err?.response?.data || err.message;
      return { ok: false, error: message };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await api.post("/logout");
    } catch {
      // ignore
    }
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
