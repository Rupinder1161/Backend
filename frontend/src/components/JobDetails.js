import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [appointment, setAppointment] = useState(null);
  const [techs, setTechs] = useState([]);
  const [selectedTech, setSelectedTech] = useState("");
  const [status, setStatus] = useState("");
  const [workDone, setWorkDone] = useState("");
  const [completionType, setCompletionType] = useState("");
  const [revenue, setRevenue] = useState("");
  const [finalNotes, setFinalNotes] = useState("");
  const [message, setMessage] = useState("");
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const isAdmin = user?.role === "admin" || user?.role === "seniorTech";
  const isTech = user?.role === "tech";

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/appointments/${id}`);
        setAppointment(res.data);
        setStatus(res.data.status || "Booked");
        setWorkDone(res.data.workDone || "");
        setCompletionType(res.data.completionType || "");
        setFinalNotes(res.data.finalNotes || "");
        setSelectedTech(res.data.assignedTech?._id || "");
      } catch (error) {
        console.error(error);
        setMessage("Failed to load job details.");
      }
    };

    fetchAppointment();
  }, [apiUrl, id]);

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/auth/users`);
        const techUsers = res.data.filter(
          (u) => u.role === "tech" && u.active !== false
        );
        setTechs(techUsers);
      } catch (error) {
        console.error("Error fetching techs:", error);
      }
    };

    if (isAdmin) {
      fetchTechs();
    }
  }, [apiUrl, isAdmin]);

  const handleAssignTech = async () => {
    try {
      const res = await axios.put(`${apiUrl}/api/appointments/${id}/assign-tech`, {
        techId: selectedTech,
      });

      setAppointment(res.data);
      setStatus("Assigned");
      setMessage("Tech assigned successfully!");
    } catch (error) {
      console.error(error);
      setMessage("Failed to assign tech.");
    }
  };
  const handleSave = async () => {
    try {
      const res = await axios.put(`${apiUrl}/api/appointments/${id}/job-update`, {
        status,
        workDone,
        completionType,
        finalNotes,
      });

      setAppointment(res.data);
      setMessage("Job updated successfully!");

      if (status === "Needs Feedback") {
        setShowFeedbackPopup(true);
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to update job.");
    }
  };

  const handleCompleteJob = async () => {
    try {
      const res = await axios.put(`${apiUrl}/api/appointments/${id}/complete-job`, {
        workDone,
        completionType,
        revenue,
      });

      setAppointment(res.data.appointment);
      setStatus(res.data.appointment.status);
      setMessage("Job completed and customer record updated!");

      if (completionType === "partial") {
        setShowFeedbackPopup(true);
      } else {
        navigate(`/feedback/${id}`);
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to complete job.");
    }
  };

  const handleCloseJob = async () => {
    try {
      const res = await axios.put(`${apiUrl}/api/appointments/${id}/close-job`, {
        finalNotes,
      });

      setAppointment(res.data.appointment);
      setStatus(res.data.appointment.status);
      setMessage("Job closed successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to close job.");
    }
  };

  const handleReopen = async () => {
    try {
      const res = await axios.put(`${apiUrl}/api/appointments/${id}/reopen`);
      setAppointment(res.data.appointment);
      setStatus(res.data.appointment.status);
      setMessage("Job reopened successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to reopen job.");
    }
  };

  const goToFeedback = () => {
    navigate(`/feedback/${id}`);
  };

  if (!appointment) return <p style={{ padding: "20px" }}>Loading job details...</p>;

  const isClosed =
    appointment.status === "Closed" ||
    appointment.status === "Completed and Closed Successfully";

  return (
    <div style={styles.container}>
      <div style={styles.headerCard}>
        <h1>Job Details</h1>
        <p style={styles.subTitle}>
          Manage this job step by step. Start with consent, then complete, feedback, and close.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Job Overview</h3>
          <p><strong>Customer:</strong> {appointment.customerName}</p>
          <p><strong>Phone:</strong> {appointment.phone}</p>
          <p><strong>Address:</strong> {appointment.address}</p>
          <p><strong>Issue:</strong> {appointment.issueType}</p>
          <p><strong>Description:</strong> {appointment.issueDescription}</p>
          <p><strong>Status:</strong> {appointment.status}</p>
          <p><strong>Job #:</strong> {appointment.jobNumber || "N/A"}</p>
          <p><strong>Assigned Tech:</strong> {appointment.assignedTech?.name || "Not assigned"}</p>
        </div>

        {isAdmin && (
          <div style={styles.card}>
            <h3>Assign Technician</h3>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              style={styles.input}
            >
              <option value="">Select tech</option>
              {techs.map((tech) => (
                <option key={tech._id} value={tech._id}>
                  {tech.name} ({tech.email})
                </option>
              ))}
            </select>

            <button
              onClick={handleAssignTech}
              style={styles.greenButton}
              disabled={!selectedTech}
            >
              Assign Tech
            </button>
          </div>
        )}
      </div>

      <div style={styles.card}>
        <h3>Tech Work Area</h3>
        <p style={styles.helperText}>
          For techs: start with consent, then add work notes, then complete or close the job.
        </p>

        <label>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={styles.input}
          disabled={isTech && isClosed}
        >
          <option value="Booked">Booked</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Assigned">Assigned</option>
          <option value="Awaiting Consent">Awaiting Consent</option>
          <option value="In Progress">In Progress</option>
          <option value="Needs Feedback">Needs Feedback</option>
          <option value="Completed">Completed</option>
          <option value="Partially Completed">Partially Completed</option>
          <option value="Completed and Closed Successfully">Completed and Closed Successfully</option>
          <option value="Closed">Closed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <label>Work Done</label>
        <textarea
          value={workDone}
          onChange={(e) => setWorkDone(e.target.value)}
          placeholder="Write a few words about the work done..."
          style={styles.textarea}
        />

        <label>Completion Type</label>
        <select
          value={completionType}
          onChange={(e) => setCompletionType(e.target.value)}
          style={styles.input}
        >
          <option value="">Select type</option>
          <option value="completed">Completed</option>
          <option value="partial">Partially Completed</option>
        </select>

        <label>Revenue</label>
        <input
          type="number"
          value={revenue}
          onChange={(e) => setRevenue(e.target.value)}
          placeholder="Enter revenue"
          style={styles.input}
        />

        <label>Final Notes</label>
        <textarea
          value={finalNotes}
          onChange={(e) => setFinalNotes(e.target.value)}
          placeholder="Add final notes..."
          style={styles.textarea}
        />
        
       <div style={styles.buttonRow}>
  <button onClick={handleSave} style={styles.blueButton}>
    Save Job Update
  </button>

  <button onClick={handleCompleteJob} style={styles.greenButton}>
    Complete Job
  </button>

  <button onClick={handleCloseJob} style={styles.grayButton}>
    Close Job
  </button>

  {isAdmin && isClosed && (
    <button onClick={handleReopen} style={styles.redButton}>
      Reopen Job
    </button>
  )}
</div>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      {showFeedbackPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <h3>Request Feedback</h3>
            <p>This job is ready for customer feedback. Open the feedback page?</p>
            <div style={styles.popupButtons}>
              <button onClick={goToFeedback} style={styles.greenButton}>
                Yes
              </button>
              <button onClick={() => setShowFeedbackPopup(false)} style={styles.grayButton}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  headerCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },
  subTitle: {
    margin: "8px 0 0",
    color: "#6b7280",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    resize: "vertical",
  },
  helperText: {
    color: "#6b7280",
    marginTop: 0,
    marginBottom: "12px",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  blueButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#007bff",
    color: "white",
    cursor: "pointer",
  },
  greenButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#28a745",
    color: "white",
    cursor: "pointer",
  },
  grayButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#6c757d",
    color: "white",
    cursor: "pointer",
  },
  redButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#dc3545",
    color: "white",
    cursor: "pointer",
  },
  message: {
    marginTop: "16px",
    fontWeight: "bold",
  },
  popupOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popup: {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    maxWidth: "450px",
    width: "90%",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  popupButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
    justifyContent: "flex-end",
  },
};

export default JobDetails;