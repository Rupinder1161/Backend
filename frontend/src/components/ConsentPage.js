import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ConsentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [accepted, setAccepted] = useState(false);
  const [message, setMessage] = useState("");

  const handleProceed = async () => {
    try {
      await axios.put(`${apiUrl}/api/appointments/${id}/consent`, {
        consentAcceptedByCustomer: accepted,
        consentNotesVersion: "v1",
      });

      navigate(`/job/${id}`);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to save consent.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Customer Consent</h1>
          <p style={styles.subtitle}>
            Please review and accept the statement below before the technician continues.
          </p>
        </div>

        <div style={styles.noticeBox}>
          <h3 style={styles.noticeTitle}>Privacy & Data Warning</h3>
          <p style={styles.text}>
            By proceeding, you agree that the technician may access your device or
            network to diagnose and repair the issue. You understand that
            troubleshooting may involve changes to device settings, software,
            or stored data, and there is a risk of data loss. SeniorTech is not
            responsible for pre-existing issues or data loss except where
            required by law.
          </p>
        </div>

        <label style={styles.checkboxRow}>
  <input
    type="checkbox"
    checked={accepted}
    onChange={(e) => setAccepted(e.target.checked)}
    style={styles.checkbox}
  />
  <span style={styles.checkboxText}>
    I agree to the terms and privacy statement.
  </span>
</label>

        <div style={styles.buttonRow}>
          <button
            onClick={handleProceed}
            disabled={!accepted}
            style={accepted ? styles.button : styles.buttonDisabled}
          >
            Agree and Continue
          </button>

          <button
            onClick={() => navigate(-1)}
            style={styles.secondaryButton}
          >
            Go Back
          </button>
        </div>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "760px",
    background: "#fff",
    padding: "32px",
    borderRadius: "16px",
    boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
  },
  header: {
    marginBottom: "20px",
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    color: "#111827",
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#6b7280",
    lineHeight: 1.6,
  },
  noticeBox: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
  },
  noticeTitle: {
    margin: "0 0 10px",
    fontSize: "18px",
    color: "#111827",
  },
  text: {
    margin: 0,
    lineHeight: 1.8,
    color: "#374151",
  },
  checkboxRow: {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "24px",
  cursor: "pointer",
  lineHeight: 1.6,
},
checkbox: {
  width: "18px",
  height: "18px",
  margin: 0,
  flexShrink: 0,
},
checkboxText: {
  color: "#111827",
  lineHeight: 1.6,
  display: "block",
},
  buttonRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
  buttonDisabled: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#93c5fd",
    color: "#fff",
    cursor: "not-allowed",
    fontWeight: "600",
  },
  secondaryButton: {
    padding: "12px 18px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#fff",
    color: "#111827",
    cursor: "pointer",
    fontWeight: "600",
  },
  message: {
    marginTop: "16px",
    textAlign: "center",
    color: "#374151",
  },
};

export default ConsentPage;