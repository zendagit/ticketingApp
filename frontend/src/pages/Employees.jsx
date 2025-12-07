import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Employees() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch employees
  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      setError("Forbidden — admins only");
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/employees");
        if (!cancelled) {
          if (res.data && res.data.status) {
            setEmployees(res.data.employees || []);
          } else {
            setError("Unexpected server response");
          }
        }
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || "Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Delete employee
  async function handleDelete(id) {
    const ok = window.confirm("Delete this employee? This cannot be undone.");
    if (!ok) return;

    setDeletingId(id);
    setError(null);
    try {
      const res = await api.delete(`/employees/${id}`);
      if (res.data && res.data.status) {
        // remove from local list immediately
        setEmployees((prev) => prev.filter((e) => e.id !== id));
      } else {
        setError("Failed to delete employee");
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data || e?.message || "Delete failed";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Employees</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate("/dashboard")}>Back to dashboard</button>{" "}
        <button onClick={() => navigate("/admin/employees/create")}>Create employee</button>
      </div>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div>Loading employees…</div>
      ) : employees.length === 0 ? (
        <div>No employees found.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: 8 }}>ID</th>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Email</th>
              <th style={{ padding: 8 }}>Phone</th>
              <th style={{ padding: 8 }}>Created</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 8 }}>{e.id}</td>
                <td style={{ padding: 8 }}>{e.name}</td>
                <td style={{ padding: 8 }}>{e.email}</td>
                <td style={{ padding: 8 }}>{e.phone || "-"}</td>
                <td style={{ padding: 8 }}>{new Date(e.created_at).toLocaleString()}</td>
                <td style={{ padding: 8 }}>
                  <button
                    onClick={() => navigate(`/admin/employees/${e.id}`)}
                    style={{ marginRight: 8, padding: "6px 10px" }}
                    title="View"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    disabled={deletingId === e.id}
                    style={{ padding: "6px 10px" }}
                    title="Delete"
                  >
                    {deletingId === e.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
