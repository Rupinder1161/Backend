import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function TechDashboard() {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        if (!user?.id) return;

        const res = await axios.get(`${apiUrl}/api/appointments/tech/${user.id}`);
        setJobs(res.data);
      } catch (error) {
        console.error("Error fetching tech jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [apiUrl, user]);

  return (
    <div style={styles.container}>
      <h1>My Jobs</h1>
      <p>Welcome, {user?.name}</p>

      {message && <p>{message}</p>}

      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p>No jobs assigned to you yet.</p>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Job #</th>
                <th style={styles.th}>Customer</th>
                <th style={styles.th}>Address</th>
                <th style={styles.th}>Issue</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, index) => (
                <tr
                  key={job._id}
                  style={index % 2 === 0 ? styles.rowLight : styles.rowWhite}
                >
                  <td style={styles.td}>{job.jobNumber || "N/A"}</td>
                  <td style={styles.td}>{job.customerName}</td>
                  <td style={styles.td}>{job.address}</td>
                  <td style={styles.td}>{job.issueType}</td>
                  <td style={styles.td}>{job.status}</td>
                  <td style={styles.td}>
                    <div style={styles.buttons}>
                      <button
                        onClick={() => navigate(`/job/${job._id}/consent`)}
                        style={styles.startButton}
                      >
                        Start Job
                      </button>
                      <button
                        onClick={() => navigate(`/job/${job._id}`)}
                        style={styles.viewButton}
                      >
                        Open
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1400px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1100px",
  },
  th: {
    padding: "14px 12px",
    background: "#f3f4f6",
    borderBottom: "2px solid #d1d5db",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
  },
  rowLight: {
    backgroundColor: "#f8fbff",
  },
  rowWhite: {
    backgroundColor: "#ffffff",
  },
  buttons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  startButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    background: "#28a745",
    color: "#fff",
    cursor: "pointer",
  },
  viewButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
};

export default TechDashboard;