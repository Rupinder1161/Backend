import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function Feedback() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const [appointment, setAppointment] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/appointments/${id}`);
        setAppointment(res.data);
      } catch (error) {
        console.error(error);
        setMessage("Failed to load feedback form.");
      }
    };

    fetchAppointment();
  }, [apiUrl, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${apiUrl}/api/appointments/${id}/feedback`, {
        feedbackRating,
        feedbackComment,
      });

      setMessage("Thank you for your feedback! Redirecting back to job...");
      setTimeout(() => {
        navigate(`/job/${id}`);
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage("Failed to submit feedback.");
    }
  };

  if (!appointment) return <p style={{ padding: "20px" }}>Loading feedback form...</p>;

  return (
    <div style={styles.container}>
      <h1>Customer Feedback</h1>

      <div style={styles.card}>
        <p><strong>Customer:</strong> {appointment.customerName}</p>
        <p><strong>Job Status:</strong> {appointment.status}</p>

        <form onSubmit={handleSubmit}>
          <label>Rating</label>
          <select
            value={feedbackRating}
            onChange={(e) => setFeedbackRating(Number(e.target.value))}
            style={styles.input}
          >
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Very Good</option>
            <option value={3}>3 - Good</option>
            <option value={2}>2 - Fair</option>
            <option value={1}>1 - Poor</option>
          </select>

          <label>Comment</label>
          <textarea
            value={feedbackComment}
            onChange={(e) => setFeedbackComment(e.target.value)}
            placeholder="Tell us about your experience..."
            style={styles.textarea}
          />

          <button type="submit" style={styles.button}>
            Submit Feedback
          </button>
        </form>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
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
    background: "#28a745",
    color: "white",
    cursor: "pointer",
  },
};

export default Feedback;