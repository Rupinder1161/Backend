import React, { useEffect, useState } from "react";
import axios from "axios";

function ManageReferrers() {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [referrers, setReferrers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    referralCode: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadReferrers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/referrers`);
      setReferrers(res.data || []);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load referrers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${apiUrl}/api/referrers`, formData);
      setMessage("Referrer created successfully!");
      setFormData({
        name: "",
        phone: "",
        email: "",
        referralCode: "",
      });
      await loadReferrers();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to create referrer.");
    }
  };

  return (
    <div style={styles.container}>
      <h1>Manage Referrers</h1>

      <div style={styles.card}>
        <h2>Create Referrer</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            type="text"
            name="referralCode"
            placeholder="Referral Code"
            value={formData.referralCode}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Create Referrer
          </button>
        </form>
      </div>

      <div style={styles.card}>
        <h2>Referrer List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : referrers.length === 0 ? (
          <p>No referrers found.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Phone</th>
                <th style={styles.th}>Code</th>
                <th style={styles.th}>Revenue</th>
                <th style={styles.th}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {referrers.map((r, index) => (
                <tr
                  key={r._id}
                  style={index % 2 === 0 ? styles.rowLight : styles.rowWhite}
                >
                  <td style={styles.td}>{r.name}</td>
                  <td style={styles.td}>{r.phone}</td>
                  <td style={styles.td}>{r.referralCode}</td>
                  <td style={styles.td}>${r.totalRevenue}</td>
                  <td style={styles.td}>${r.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {message && <p>{message}</p>}
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
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },
  form: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginTop: "16px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
    gridColumn: "1 / -1",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "16px",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    background: "#f3f4f6",
    borderBottom: "2px solid #d1d5db",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb",
  },
  rowLight: {
    backgroundColor: "#f8fbff",
  },
  rowWhite: {
    backgroundColor: "#ffffff",
  },
};

export default ManageReferrers;