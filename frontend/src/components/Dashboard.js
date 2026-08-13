import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState("open"); // open | closed | all
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/appointments`);
        setAppointments(res.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [apiUrl]);

  const isClosedStatus = (status) =>
    status === "Closed" || status === "Completed and Closed Successfully";

  const filteredAppointments = appointments.filter((appt) => {
    if (viewFilter === "all") return true;
    if (viewFilter === "closed") return isClosedStatus(appt.status);
    return !isClosedStatus(appt.status);
  });

  const openCount = appointments.filter((appt) => !isClosedStatus(appt.status)).length;
  const closedCount = appointments.filter((appt) => isClosedStatus(appt.status)).length;

  const getStatusBadge = (status) => {
    if (status === "Completed and Closed Successfully") return "status-success";
    if (status === "Closed") return "status-closed";
    if (status === "Completed") return "status-completed";
    if (status === "Needs Feedback") return "status-feedback";
    if (status === "In Progress") return "status-progress";
    if (status === "Scheduled") return "status-scheduled";
    if (status === "Assigned") return "status-assigned";
    return "status-default";
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="dashboard-subtitle">
            Manage active jobs, track completed jobs, and reopen closed jobs if needed.
          </p>
        </div>

        <div className="dashboard-stats-inline">
          <div className="mini-stat">
            <span>Open Jobs</span>
            <strong>{openCount}</strong>
          </div>
          <div className="mini-stat">
            <span>Closed Jobs</span>
            <strong>{closedCount}</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={viewFilter === "open" ? "tab active" : "tab"}
          onClick={() => setViewFilter("open")}
        >
          Open Jobs
        </button>
        <button
          className={viewFilter === "closed" ? "tab active" : "tab"}
          onClick={() => setViewFilter("closed")}
        >
          Closed Jobs
        </button>
        <button
          className={viewFilter === "all" ? "tab active" : "tab"}
          onClick={() => setViewFilter("all")}
        >
          All Jobs
        </button>
      </div>

      {loading ? (
        <p>Loading appointments...</p>
      ) : filteredAppointments.length === 0 ? (
        <p>No appointments found for this view.</p>
      ) : (
        <div className="table-wrapper">
          <table className="appointments-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Issue Type</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appt, index) => (
                <tr
                  key={appt._id}
                  className={index % 2 === 0 ? "row-light" : "row-white"}
                  onClick={() => navigate(`/job/${appt._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{appt.customerName}</td>
                  <td>{appt.phone}</td>
                  <td>{appt.address}</td>
                  <td>{appt.issueType}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadge(appt.status)}`}>
                      {appt.status}
                    </span>
                  </td>
                  <td>{new Date(appt.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;