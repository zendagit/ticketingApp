import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function TicketEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("open");
  const [assignedTo, setAssignedTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        // load tickets list and find the single ticket
        const tRes = await api.get("/tickets");
        const found = tRes.data?.tickets?.find(t => String(t.id) === String(id));
        if (!cancelled) {
          if (!found) {
            setError("Ticket not found");
            setTicket(null);
          } else {
            setTicket(found);
            setTitle(found.title || "");
            setDescription(found.description || "");
            setStatus(found.status || "open");
            setAssignedTo(found.assigned_to || "");
          }
        }

        // load employees
        const eRes = await api.get("/employees");
        if (!cancelled && eRes.data && eRes.data.status) {
          setEmployees(eRes.data.employees || []);
        }
      } catch (e) {
        setError(e?.response?.data?.message || e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id, user]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        assigned_to: assignedTo || null
      };

      const res = await api.put(`/tickets/${id}`, payload);
      if (res.data && res.data.status) {
        navigate("/admin/tickets");
        return;
      }
      setError("Failed to save ticket");
    } catch (err) {
      const msg = err?.response?.data?.message || JSON.stringify(err?.response?.data) || err?.message;
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading…</div>;
  if (error) return <div style={{ padding: 20, color: "crimson" }}>{error}</div>;
  if (!ticket) return <div style={{ padding: 20 }}>Ticket not found.</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Edit Ticket #{ticket.id}</h2>

      <button onClick={() => navigate("/admin/tickets")} style={{ marginBottom: 12 }}>Back</button>

      <form onSubmit={handleSave} style={{ maxWidth: 700 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: "100%", padding: 8 }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ width: "100%", padding: 8 }} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: "100%", padding: 8 }}>
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Assigned to</label>
          <select value={assignedTo ?? ""} onChange={(e) => setAssignedTo(e.target.value)} style={{ width: "100%", padding: 8 }}>
            <option value="">-- unassigned --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.email})
              </option>
            ))}
          </select>
        </div>

        {error && <div style={{ color: "crimson", marginBottom: 10 }}>{error}</div>}

        <div>
          <button type="submit" disabled={saving} style={{ padding: "8px 12px" }}>
            {saving ? "Saving..." : "Save"}
          </button>{" "}
          <button type="button" onClick={() => navigate("/admin/tickets")} style={{ padding: "8px 12px" }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
