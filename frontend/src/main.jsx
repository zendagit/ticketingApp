import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import "./index.css";
import Employees from "./pages/Employees";
import CreateEmployee from "./pages/CreateEmployee";
import Tickets from "./pages/Tickets";
import TicketCreate from "./pages/TicketCreate";
import TicketAssign from "./pages/TicketAssign";
import MyTickets from "./pages/MyTickets";
import TicketEdit from "./pages/TicketEdit";
import NavBar from "./components/NavBar";



function PrivateRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/employees"
        element={
          <PrivateRoute>
            <Employees />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
            <PrivateRoute>
             <Tickets />
            </PrivateRoute>
        }
        />
        <Route
        path="/admin/employees/create"
        element={
          <PrivateRoute>
            <CreateEmployee />
          </PrivateRoute>
        }
        />
        <Route
        path="/admin/tickets/create"
        element={
          <PrivateRoute>
            <TicketCreate />
          </PrivateRoute>
        }
        />
        <Route
        path="/admin/tickets/:id/assign"
        element={
          <PrivateRoute>
            <TicketAssign />
          </PrivateRoute>
        }
        />
        <Route
        path="/employee/tickets"
        element={
           <PrivateRoute>
            <MyTickets />
           </PrivateRoute>
        }
        />
        <Route
        path="/admin/tickets/:id/edit"
        element={
           <PrivateRoute>
             <TicketEdit />
           </PrivateRoute>
        }
        />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
