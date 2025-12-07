import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function CreateEmployee() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // simple guard - only show for admins
  if (user && user.role !== "admin") {
    return <div style={{ padding: 20, color: "crimson" }}>Forbidden — admins only</div>;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const body = {
        name: name.trim(),
        email: email.trim(),
        password,
        role: "employee",
        phone: phone.trim() || null,
      };

      const res = await api.post("/register", body);
      if (res.data && res.data.status) {
        // Navigate back to list and let the list refresh when mounted
        navigate("/admin/employees");
      } else {
        setError(res.data || "Unexpected response");
      }
    } catch (err) {
      const msg = err?.response?.data || err?.message || "Network error";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 600 }}>
      <h2>Create Employee</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: "100%", padding: 8 }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: "100%", padding: 8 }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={{ width: "100%", padding: 8 }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Phone (optional)</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: "100%", padding: 8 }} />
        </div>

        {error && <div style={{ color: "crimson", marginBottom: 8 }}>{typeof error === "string" ? error : JSON.stringify(error)}</div>}

        <div>
          <button type="submit" disabled={submitting} style={{ padding: "8px 12px" }}>
            {submitting ? "Creating..." : "Create employee"}
          </button>{" "}
          <button type="button" onClick={() => navigate("/admin/employees")} style={{ padding: "8px 12px" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
