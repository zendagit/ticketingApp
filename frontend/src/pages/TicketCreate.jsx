import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TicketCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      setError("Forbidden");
      return;
    }

    async function loadEmployees() {
      try {
        const res = await api.get("/employees");
        if (res.data.status) {
          setEmployees(res.data.employees);
        }
      } catch (e) {
        setError("Failed to load employees");
      }
    }

    loadEmployees();
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/tickets", {
        title,
        description,
        priority,
        assigned_to: assignedTo || null
      });

      if (res.data.status) {
        navigate("/admin/tickets");
        return;
      }

      setError("Failed to create ticket");
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        JSON.stringify(e?.response?.data) ||
        e?.message;

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Ticket</h2>

      <button onClick={() => navigate("/admin/tickets")} style={{ marginBottom: 20 }}>
        Back
      </button>

      {error && (
        <div style={{ color: "crimson", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: 500 }}>
        <div style={{ marginBottom: 12 }}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={4}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Priority</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Assign to (optional)</label>
          <select
            value={assignedTo}
            onChange={e => setAssignedTo(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="">unassigned</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.email})
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
