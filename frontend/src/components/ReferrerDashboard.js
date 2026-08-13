import React, { useEffect, useState } from "react";
import axios from "axios";

function ReferrerDashboard() {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [referrers, setReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [payoutInputs, setPayoutInputs] = useState({});

  const loadReferrers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/referrers`);
      setReferrers(res.data || []);
    } catch (error) {
      console.error("Error fetching referrers:", error);
      setMessage("Failed to load referrers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrers();
  }, []);

  const handlePayoutChange = (id, value) => {
    setPayoutInputs({
      ...payoutInputs,
      [id]: value,
    });
  };

  const handlePayout = async (id) => {
    try {
      const paidAmount = payoutInputs[id];

      if (!paidAmount) {
        setMessage("Please enter a payout amount.");
        return;
      }

      await axios.put(`${apiUrl}/api/referrers/${id}/payout`, {
        paidAmount,
      });

      setMessage("Payout updated successfully!");
      setPayoutInputs({
        ...payoutInputs,
        [id]: "",
      });

      await loadReferrers();
    } catch (error) {
      console.error(error);
      setMessage("Failed to update payout.");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Referrer Dashboard</h1>

      {message && <p>{message}</p>}

      {loading ? (
        <p>Loading referrers...</p>
      ) : referrers.length === 0 ? (
        <p>No referrers found.</p>
      ) : (
        <div style={styles.grid}>
          {referrers.map((referrer, index) => (
            <div
              key={referrer._id}
              style={index % 2 === 0 ? styles.cardLight : styles.cardWhite}
            >
              <h3>{referrer.name}</h3>
              <p><strong>Phone:</strong> {referrer.phone}</p>
              <p><strong>Email:</strong> {referrer.email || "N/A"}</p>
              <p><strong>Code:</strong> {referrer.referralCode}</p>

              <p><strong>Total Referrals:</strong> {referrer.totalReferrals}</p>
              <p><strong>Scheduled:</strong> {referrer.scheduledReferrals}</p>
              <p><strong>Successful:</strong> {referrer.successfulReferrals}</p>
              <p><strong>Unsuccessful:</strong> {referrer.unsuccessfulReferrals}</p>

              <p><strong>Total Revenue:</strong> ${referrer.totalRevenue}</p>
              <p><strong>Paid Out:</strong> ${referrer.paidOut}</p>
              <p><strong>Balance:</strong> ${referrer.balance}</p>

              <div style={styles.payoutBox}>
                <input
                  type="number"
                  placeholder="Payout amount"
                  value={payoutInputs[referrer._id] || ""}
                  onChange={(e) =>
                    handlePayoutChange(referrer._id, e.target.value)
                  }
                  style={styles.input}
                />
                <button
                  onClick={() => handlePayout(referrer._id)}
                  style={styles.button}
                >
                  Add Payout
                </button>
              </div>
            </div>
          ))}
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  cardLight: {
    background: "#f8fbff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  cardWhite: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  payoutBox: {
    display: "flex",
    gap: "10px",
    marginTop: "14px",
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    minWidth: "160px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
};

export default ReferrerDashboard;