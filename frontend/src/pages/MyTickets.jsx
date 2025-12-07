import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyTickets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "employee") {
      setError("Forbidden — employees only");
      return;
    }

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/my-tickets");
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

  async function handleComplete(id) {
    const ok = window.confirm("Mark ticket as completed?");
    if (!ok) return;

    setProcessingId(id);
    setError(null);
    try {
      const res = await api.post(`/my-tickets/${id}/complete`);
      if (res.data && res.data.status) {
        // update local state: set status to completed
        setTickets(prev => prev.map(t => (t.id === id ? { ...t, status: "completed" } : t)));
      } else {
        setError("Failed to mark complete");
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data || e?.message || "Operation failed";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>My Tickets</h2>

      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navigate("/dashboard")}>Back</button>
      </div>

      {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <div>Loading tickets…</div>
      ) : tickets.length === 0 ? (
        <div>No tickets assigned to you.</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: 8 }}>ID</th>
              <th style={{ padding: 8 }}>Title</th>
              <th style={{ padding: 8 }}>Status</th>
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
                <td style={{ padding: 8 }}>{new Date(t.created_at).toLocaleString()}</td>
                <td style={{ padding: 8 }}>
                  <button
                    onClick={() => navigate(`/employee/tickets/${t.id}`)}
                    style={{ marginRight: 8 }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleComplete(t.id)}
                    disabled={processingId === t.id || t.status === "completed"}
                    title={t.status === "completed" ? "Already completed" : "Mark complete"}
                  >
                    {processingId === t.id ? "Processing..." : t.status === "completed" ? "Completed" : "Mark complete"}
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
