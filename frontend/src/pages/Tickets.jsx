import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Tickets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
        const res = await api.get("/tickets");
        if (!cancelled) {
          if (res.data && res.data.status) {
            setTickets(res.data.tickets || []);
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
    return () => { cancelled = true; };
  }, [user]);

  async function handleDelete(id) {
    if (!window.confirm("Delete this ticket?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await api.delete(`/tickets/${id}`);
      if (res.data && res.data.status) {
        setTickets(prev => prev.filter(t => t.id !== id));
      } else {
        setError("Failed to delete ticket");
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
      <h2>Tickets</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate("/dashboard")}>Back</button>{" "}
        <button onClick={() => navigate("/admin/tickets/create")}>Create ticket</button>
      </div>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div>Loading tickets…</div>
      ) : tickets.length === 0 ? (
        <div>No tickets found.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: 8 }}>ID</th>
              <th style={{ padding: 8 }}>Title</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Assigned To</th>
              <th style={{ padding: 8 }}>Created By</th>
              <th style={{ padding: 8 }}>Created</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(t => (
              <tr key={t.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: 8 }}>{t.id}</td>
                <td style={{ padding: 8 }}>{t.title}</td>
                <td style={{ padding: 8 }}>{t.status}</td>
                <td style={{ padding: 8 }}>{t.assignee ? `${t.assignee.name} (${t.assignee.email})` : "—"}</td>
                <td style={{ padding: 8 }}>{t.creator ? t.creator.name : "—"}</td>
                <td style={{ padding: 8 }}>{new Date(t.created_at).toLocaleString()}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => navigate(`/admin/tickets/${t.id}`)} style={{ marginRight: 8 }}>View</button>
                  <button onClick={() => navigate(`/admin/tickets/${t.id}/assign`)} style={{ marginRight: 8 }}>Assign</button>
                  <button onClick={() => navigate(`/admin/tickets/${t.id}/edit`)} style={{ marginRight: 8 }}>Edit</button>
                  <button onClick={() => handleDelete(t.id)} disabled={deletingId===t.id}>
                    {deletingId===t.id ? "Deleting..." : "Delete"}
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
