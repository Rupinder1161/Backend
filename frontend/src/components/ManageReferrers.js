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
    password: "",
  });

  const [passwordUpdates, setPasswordUpdates] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    loadReferrers();
  }, [apiUrl]);

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
      setMessage("Referrer and login created successfully!");
      setFormData({
        name: "",
        phone: "",
        email: "",
        referralCode: "",
        password: "",
      });

      const res = await axios.get(`${apiUrl}/api/referrers`);
      setReferrers(res.data || []);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to create referrer.");
    }
  };

  const handlePasswordChange = (id, value) => {
    setPasswordUpdates({
      ...passwordUpdates,
      [id]: value,
    });
  };

  const handlePasswordUpdate = async (id) => {
    try {
      const newPassword = passwordUpdates[id];
      if (!newPassword) {
        setMessage("Please enter a new password.");
        return;
      }

      await axios.put(`${apiUrl}/api/referrers/${id}/password`, {
        password: newPassword,
      });

      setMessage("Referrer password updated successfully!");
      setPasswordUpdates({
        ...passwordUpdates,
        [id]: "",
      });
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to update password.");
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
            required
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
          <input
            type="password"
            name="password"
            placeholder="Login Password"
            value={formData.password}
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
          <div style={styles.list}>
            {referrers.map((r, index) => (
              <div
                key={r._id}
                style={index % 2 === 0 ? styles.referrerCardLight : styles.referrerCardWhite}
              >
                <h3>{r.name}</h3>
                <p><strong>Email:</strong> {r.email}</p>
                <p><strong>Phone:</strong> {r.phone}</p>
                <p><strong>Code:</strong> {r.referralCode}</p>
                <p><strong>Total Revenue:</strong> ${r.totalRevenue}</p>
                <p><strong>Balance:</strong> ${r.balance}</p>

                <div style={styles.passwordBox}>
                  <input
                    type="password"
                    placeholder="New password"
                    value={passwordUpdates[r._id] || ""}
                    onChange={(e) => handlePasswordChange(r._id, e.target.value)}
                    style={styles.input}
                  />
                  <button
                    type="button"
                    onClick={() => handlePasswordUpdate(r._id)}
                    style={styles.updateButton}
                  >
                    Update Password
                  </button>
                </div>
              </div>
            ))}
          </div>
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
    width: "100%",
    boxSizing: "border-box",
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
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "16px",
  },
  referrerCardLight: {
    background: "#f8fbff",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  referrerCardWhite: {
    background: "#ffffff",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  passwordBox: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "12px",
  },
  updateButton: {
    padding: "12px 16px",
    border: "none",
    borderRadius: "8px",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
};

export default ManageReferrers;