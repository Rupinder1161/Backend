import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";

import Dashboard from "./components/Dashboard";
import JobDetails from "./components/JobDetails";
import BookAppointment from "./components/BookAppointment";
import Feedback from "./components/Feedback";
import CustomerDashboard from "./components/CustomerDashboard";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from "./components/UserManagement";
import TechDashboard from "./components/TechDashboard";
import ConsentPage from "./components/ConsentPage";
import ReferrerDashboard from "./components/ReferrerDashboard";
import ManageReferrers from "./components/ManageReferrers";

function AppRoutes() {
  const { user, logout, loadingAuth } = React.useContext(AuthContext);

  if (loadingAuth) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <>
      {user && (
        <nav style={styles.nav}>
          <span style={styles.brand}>SeniorTech Job Hub</span>

          <div style={styles.links}>
            {(user.role === "admin" || user.role === "seniorTech") && (
              <>
                <Link to="/" style={styles.link}>
                  Dashboard
                </Link>
                <Link to="/book-appointment" style={styles.link}>
                  Book Appointment
                </Link>
                <Link to="/customers" style={styles.link}>
                  Customers
                </Link>
                <Link to="/referrers" style={styles.link}>
                  Referrers
                </Link>
              </>
            )}

            {user.role === "admin" && (
              <>
                <Link to="/users" style={styles.link}>
                  Team Members
                </Link>
                <Link to="/manage-referrers" style={styles.link}>
                  Manage Referrers
                </Link>
              </>
            )}

            {user.role === "tech" && (
              <Link to="/tech" style={styles.link}>
                My Jobs
              </Link>
            )}
          </div>

          <button onClick={logout} style={styles.logoutButton}>
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
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tech"
          element={
            <ProtectedRoute allowedRoles={["tech"]}>
              <TechDashboard />
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
          path="/job/:id/consent"
          element={
            <ProtectedRoute allowedRoles={["admin", "seniorTech", "tech"]}>
              <ConsentPage />
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
          path="/referrers"
          element={
            <ProtectedRoute allowedRoles={["admin", "seniorTech"]}>
              <ReferrerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manage-referrers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageReferrers />
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

const styles = {
  nav: {
    padding: "15px 20px",
    background: "#222",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
  },
  brand: {
    fontWeight: "bold",
    fontSize: "18px",
    marginRight: "10px",
  },
  links: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    flex: 1,
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "500",
  },
  logoutButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: "#f3f4f6",
    color: "#111827",
    fontWeight: "600",
  },
};

export default App;