import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function ReferrerDashboard() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { user } = useContext(AuthContext);

  const [referrer, setReferrer] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        if (!user?.email) return;

        const referrerRes = await axios.get(`${apiUrl}/api/referrers`);
        const match = (referrerRes.data || []).find(
          (r) => r.email?.toLowerCase() === user.email.toLowerCase()
        );

        if (!match) {
          setMessage("Referrer profile not found.");
          return;
        }

        setReferrer(match);

        const apptRes = await axios.get(`${apiUrl}/api/appointments`);
        const allAppointments = apptRes.data || [];

        const myReferrals = allAppointments.filter((appt) => {
          const codeMatch =
            appt.referralCode &&
            appt.referralCode.toLowerCase() === match.referralCode.toLowerCase();

          const emailMatch =
            appt.referrer?.email &&
            appt.referrer.email.toLowerCase() === match.email.toLowerCase();

          return codeMatch || emailMatch;
        });

        setReferrals(myReferrals);
      } catch (error) {
        console.error("Error loading referrer dashboard:", error);
        setMessage("Failed to load your referrer dashboard.");
      }
    };

    if (user) {
      loadDashboard();
    }
  }, [apiUrl, user]);

  if (!referrer) {
    return (
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>Referrer Dashboard</h1>
        <p>{message || "Loading your dashboard..."}</p>
      </div>
    );
  }

  const successfulCount = referrals.filter(
    (r) => r.referralStatus === "successful" || r.status === "Completed"
  ).length;

  const scheduledCount = referrals.filter(
    (r) => r.referralStatus === "scheduled" || r.status === "Scheduled"
  ).length;

  return (
    <div style={styles.container}>
      <div style={styles.headerCard}>
        <h1 style={styles.pageTitle}>Referrer Dashboard</h1>
        <p style={styles.subtitle}>
          Welcome, {referrer.name}. Here are your referrals and earnings.
        </p>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Your Code</h3>
          <p style={styles.bigText}>{referrer.referralCode}</p>
        </div>

        <div style={styles.card}>
          <h3>Total Referrals</h3>
          <p style={styles.bigText}>{referrals.length}</p>
        </div>

        <div style={styles.card}>
          <h3>Scheduled</h3>
          <p style={styles.bigText}>{scheduledCount}</p>
        </div>

        <div style={styles.card}>
          <h3>Successful</h3>
          <p style={styles.bigText}>{successfulCount}</p>
        </div>

        <div style={styles.card}>
          <h3>Total Earned</h3>
          <p style={styles.bigText}>${referrer.totalRevenue}</p>
        </div>

        <div style={styles.card}>
          <h3>Balance</h3>
          <p style={styles.bigText}>${referrer.balance}</p>
        </div>
      </div>

      <div style={styles.cardWide}>
        <h3>My Referred Jobs</h3>

        {referrals.length === 0 ? (
          <p>No referrals yet.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Issue</th>
                  <th style={styles.th}>Referral Status</th>
                  <th style={styles.th}>Job Status</th>
                  <th style={styles.th}>Revenue</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((appt, index) => (
                  <tr
                    key={appt._id}
                    style={index % 2 === 0 ? styles.rowLight : styles.rowWhite}
                  >
                    <td style={styles.td}>{appt.customerName}</td>
                    <td style={styles.td}>{appt.phone}</td>
                    <td style={styles.td}>{appt.issueType}</td>
                    <td style={styles.td}>{appt.referralStatus || "referred"}</td>
                    <td style={styles.td}>{appt.status}</td>
                    <td style={styles.td}>${appt.revenue || 0}</td>
                    <td style={styles.td}>
                      {appt.createdAt
                        ? new Date(appt.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "16px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  headerCard: {
    background: "#fff",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    marginBottom: "16px",
  },
  pageTitle: {
    margin: 0,
    fontSize: "28px",
  },
  subtitle: {
    color: "#6b7280",
    marginTop: "8px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  card: {
    background: "#f8fbff",
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  cardWide: {
    background: "#fff",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  bigText: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: "8px 0 0",
    wordBreak: "break-word",
  },
  tableWrapper: {
    overflowX: "auto",
    marginTop: "12px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    background: "#f3f4f6",
    borderBottom: "2px solid #d1d5db",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
  },
  rowLight: {
    backgroundColor: "#f8fbff",
  },
  rowWhite: {
    backgroundColor: "#ffffff",
  },
  message: {
    marginTop: "16px",
    color: "#374151",
  },
};

export default ReferrerDashboard;