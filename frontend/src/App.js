import React from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Dashboard from "./components/Dashboard";
import JobDetails from "./components/JobDetails";
import BookAppointment from "./components/BookAppointment";
import Feedback from "./components/Feedback";
import CustomerDashboard from "./components/CustomerDashboard";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function AppRoutes() {
  const { user, logout } = React.useContext(AuthContext);

  return (
    <>
      {user && (
        <nav style={{ padding: "15px", background: "#222", color: "#fff" }}>
          <span style={{ fontWeight: "bold", marginRight: "20px" }}>
            SeniorTech Job Hub
          </span>
          {user.role === "admin" || user.role === "seniorTech" ? (
            <>
              <Link to="/" style={{ color: "#fff", marginRight: "15px" }}>
                Dashboard
              </Link>
              <Link to="/book-appointment" style={{ color: "#fff", marginRight: "15px" }}>
                Book Appointment
              </Link>
              <Link to="/customers" style={{ color: "#fff", marginRight: "15px" }}>
                Customers
              </Link>
            </>
          ) : (
            <Link to="/tech" style={{ color: "#fff", marginRight: "15px" }}>
              My Jobs
            </Link>
          )}

          <button
            onClick={logout}
            style={{
              marginLeft: "20px",
              padding: "8px 12px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </nav>
      )}

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["admin", "seniorTech"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-appointment"
          element={
            <ProtectedRoute allowedRoles={["admin", "seniorTech"]}>
              <BookAppointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={["admin", "seniorTech"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "seniorTech", "tech"]}>
              <JobDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "seniorTech", "tech"]}>
              <Feedback />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tech"
          element={
            <ProtectedRoute allowedRoles={["tech"]}>
              <div style={{ padding: 20 }}>Tech job board coming next...</div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;