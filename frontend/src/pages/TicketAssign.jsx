import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function TicketAssign() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      setError("Forbidden — admins only");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // load ticket detail (we don't have a dedicated endpoint for single ticket; fall back to list)
        const ticketRes = await api.get("/tickets");
        const found = ticketRes.data?.tickets?.find(t => String(t.id) === String(id));
        if (!cancelled) {
          if (!found) {
            setError("Ticket not found");
            setTicket(null);
          } else {
            setTicket(found);
            setSelected(found.assigned_to || "");
          }
        }

        const empRes = await api.get("/employees");
        if (!cancelled && empRes.data && empRes.data.status) {
          setEmployees(empRes.data.employees || []);
        }
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, user]);

  async function handleAssign(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post(`/tickets/${id}/assign`, { assigned_to: selected || null });
      if (res.data && res.data.status) {
        navigate("/admin/tickets");
        return;
      }
      setError("Failed to assign ticket");
    } catch (err) {
      const msg = err?.response?.data?.message || JSON.stringify(err?.response?.data) || err?.message;
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
  if (error) return <div style={{ padding: 20, color: "crimson" }}>{error}</div>;
  if (!ticket) return <div style={{ padding: 20 }}>Ticket not found.</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Assign Ticket #{ticket.id}</h2>
      <div style={{ marginBottom: 12 }}>
        <strong>{ticket.title}</strong>
        <div style={{ marginTop: 6 }}>{ticket.description}</div>
      </div>

      <form onSubmit={handleAssign} style={{ maxWidth: 500 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Assign to</label>
          <select
            value={selected ?? ""}
            onChange={(e) => setSelected(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">-- unassigned --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.email})
              </option>
            ))}
          </select>
        </div>

        {error && <div style={{ color: "crimson", marginBottom: 12 }}>{error}</div>}

        <div>
          <button type="submit" disabled={submitting} style={{ padding: "8px 12px" }}>
            {submitting ? "Assigning..." : "Assign"}
          </button>{" "}
          <button type="button" onClick={() => navigate("/admin/tickets")} style={{ padding: "8px 12px" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
