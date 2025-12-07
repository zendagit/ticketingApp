import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const result = await login(email.trim(), password);
    if (result.ok) {
      navigate("/dashboard");
    } else {
      const msg = result.error?.message || result.error || "Login failed";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", padding: 20 }}>
      <h2>Sign in</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            style={{ width: "100%", padding: 8, marginTop: 6 }}
          />
        </div>

        {error && (
          <div style={{ color: "crimson", marginBottom: 10 }}>{error}</div>
        )}

        <button type="submit" disabled={loading} style={{ padding: "8px 14px" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
