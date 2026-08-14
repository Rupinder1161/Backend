import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function ReferrerDashboard() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);

  const [referrer, setReferrer] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadMyReferrer = async () => {
      try {
        if (!user?.email) return;

        const res = await axios.get(`${apiUrl}/api/referrers`);
        const match = (res.data || []).find(
          (r) => r.email?.toLowerCase() === user.email.toLowerCase()
        );

        if (!match) {
          setMessage("Referrer not found.");
          return;
        }

        setReferrer(match);
      } catch (error) {
        console.error("Error fetching referrer:", error);
        setMessage("Failed to load your referrer dashboard.");
      }
    };

    if (user) loadMyReferrer();
  }, [apiUrl, user]);

  if (!referrer) {
    return (
      <div style={styles.container}>
        <h1>Referrer Dashboard</h1>
        <p>{message || "Loading referrer dashboard..."}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerCard}>
        <h1>Referrer Dashboard</h1>
        <p style={styles.subtitle}>
          Welcome, {referrer.name}. Here are your referral earnings and activity.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Your Code</h3>
          <p style={styles.bigText}>{referrer.referralCode}</p>
        </div>

        <div style={styles.card}>
          <h3>Total Referrals</h3>
          <p style={styles.bigText}>{referrer.totalReferrals}</p>
        </div>

        <div style={styles.card}>
          <h3>Scheduled</h3>
          <p style={styles.bigText}>{referrer.scheduledReferrals}</p>
        </div>

        <div style={styles.card}>
          <h3>Successful</h3>
          <p style={styles.bigText}>{referrer.successfulReferrals}</p>
        </div>

        <div style={styles.card}>
          <h3>Total Earned</h3>
          <p style={styles.bigText}>${referrer.totalRevenue}</p>
        </div>

        <div style={styles.card}>
          <h3>Paid Out</h3>
          <p style={styles.bigText}>${referrer.paidOut}</p>
        </div>

        <div style={styles.card}>
          <h3>Balance</h3>
          <p style={styles.bigText}>${referrer.balance}</p>
        </div>
      </div>

      <div style={styles.cardWide}>
        <h3>Account Details</h3>
        <p><strong>Name:</strong> {referrer.name}</p>
        <p><strong>Phone:</strong> {referrer.phone}</p>
        <p><strong>Email:</strong> {referrer.email || "N/A"}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
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
  subtitle: {
    color: "#6b7280",
    marginTop: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  card: {
    background: "#f8fbff",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  cardWide: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  bigText: {
    fontSize: "28px",
    fontWeight: "bold",
    margin: "10px 0 0",
  },
};

export default ReferrerDashboard;