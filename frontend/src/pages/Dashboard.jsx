import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.name || "user"} — role: {user?.role}</p>

      <div style={{ marginTop: 10 }}>
        <button onClick={logout}>Log out</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <a href="http://localhost:5173/employee/tickets">Click here to see Tickets assigned to you.</a>
      </div>
    </div>
  );
}
