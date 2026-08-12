import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [status, setStatus] = useState("");
  const [workDone, setWorkDone] = useState("");
  const [completionType, setCompletionType] = useState("");
  const [revenue, setRevenue] = useState("");
  const [message, setMessage] = useState("");
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/appointments/${id}`);
        setAppointment(res.data);
        setStatus(res.data.status || "Booked");
        setWorkDone(res.data.workDone || "");
        setCompletionType(res.data.completionType || "");
      } catch (error) {
        console.error(error);
        setMessage("Failed to load job details.");
      }
    };

    fetchAppointment();
  }, [apiUrl, id]);

  const handleSave = async () => {
    try {
      const res = await axios.put(`${apiUrl}/api/appointments/${id}/job-update`, {
        status,
        workDone,
        completionType,
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
      setMessage("Job completed and customer saved/updated!");

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

  const goToFeedback = () => {
    navigate(`/feedback/${id}`);
  };

  if (!appointment) return <p style={{ padding: "20px" }}>Loading job details...</p>;

  return (
    <div style={styles.container}>
      <h1>Job Details</h1>

      <div style={styles.card}>
        <p><strong>Customer Name:</strong> {appointment.customerName}</p>
        <p><strong>Phone:</strong> {appointment.phone}</p>
        <p><strong>Email:</strong> {appointment.email || "N/A"}</p>
        <p><strong>Address:</strong> {appointment.address}</p>
        <p><strong>Issue Type:</strong> {appointment.issueType}</p>
        <p><strong>Description:</strong> {appointment.issueDescription}</p>
        <p><strong>Consent Accepted:</strong> {appointment.consentAccepted ? "Yes" : "No"}</p>
      </div>

      <div style={styles.card}>
        <h3>Update Job</h3>

        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={styles.input}>
          <option value="Booked">Booked</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Partially Completed">Partially Completed</option>
          <option value="Needs Feedback">Needs Feedback</option>
          <option value="Closed">Closed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <label>Completion Type</label>
        <select
          value={completionType}
          onChange={(e) => setCompletionType(e.target.value)}
          style={styles.input}
        >
          <option value="">Select type</option>
          <option value="completed">Completed</option>
          <option value="partial">Partial Completed</option>
        </select>

        <label>Work Done</label>
        <textarea
          value={workDone}
          onChange={(e) => setWorkDone(e.target.value)}
          placeholder="Describe what work was done..."
          style={styles.textarea}
        />

        <label>Revenue</label>
        <input
          type="number"
          value={revenue}
          onChange={(e) => setRevenue(e.target.value)}
          placeholder="Enter revenue"
          style={styles.input}
        />

        <button onClick={handleSave} style={styles.button}>
          Save Job Update
        </button>

        <button onClick={handleCompleteJob} style={styles.completeButton}>
          Complete Job
        </button>
      </div>

      {message && <p>{message}</p>}

      {showFeedbackPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <h3>Request Feedback</h3>
            <p>This job is ready for feedback. Open the feedback form?</p>
            <div style={styles.popupButtons}>
              <button onClick={goToFeedback} style={styles.yesButton}>
                Yes
              </button>
              <button onClick={() => setShowFeedbackPopup(false)} style={styles.noButton}>
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
    maxWidth: "900px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    marginBottom: "20px",
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
    minHeight: "140px",
    padding: "12px",
    marginBottom: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
    resize: "vertical",
  },
  button: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#007bff",
    color: "white",
    cursor: "pointer",
    marginRight: "10px",
  },
  completeButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#28a745",
    color: "white",
    cursor: "pointer",
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
    maxWidth: "420px",
    width: "90%",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  popupButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
    justifyContent: "flex-end",
  },
  yesButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#28a745",
    color: "#fff",
    cursor: "pointer",
  },
  noButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#6c757d",
    color: "#fff",
    cursor: "pointer",
  },
};

export default JobDetails;