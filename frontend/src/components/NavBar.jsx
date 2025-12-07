import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    // logout clears token and user in context/localStorage
    logout();
    navigate("/login");
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 18px",
      borderBottom: "1px solid #eee",
      background: "#fafafa"
    }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button onClick={() => navigate("/dashboard")} style={{ padding: "6px 10px" }}>
          Home
        </button>
        <button onClick={() => navigate("/admin/employees")} style={{ padding: "6px 10px" }}>
          Employees - (Admin View only)
        </button>
        <button onClick={() => navigate("/admin/tickets")} style={{ padding: "6px 10px" }}>
          Tickets - (Admin View only)
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {user ? (
          <>
            <div style={{ fontSize: 14 }}>
              <strong>{user.name}</strong> <span style={{ color: "#666" }}>({user.role})</span>
            </div>
            <button onClick={handleLogout} style={{ padding: "6px 10px" }}>
              Log out
            </button>
          </>
        ) : (
          <button onClick={() => navigate("/login")} style={{ padding: "6px 10px" }}>
            Sign in
          </button>
        )}
      </div>
    </div>
  );
}
