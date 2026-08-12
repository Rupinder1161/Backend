import React, { useEffect, useState } from "react";
import axios from "axios";

function CustomerDashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/customers`);
        setCustomers(res.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [apiUrl]);

  const handleContacted = async (id) => {
    await axios.put(`${apiUrl}/api/customers/${id}/contacted`);
    window.location.reload();
  };

  const handleReplied = async (id) => {
    await axios.put(`${apiUrl}/api/customers/${id}/replied`);
    window.location.reload();
  };

  const handleNoReply = async (id) => {
    await axios.put(`${apiUrl}/api/customers/${id}/noreply`);
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      <h1>Customer Dashboard</h1>

      {loading ? (
        <p>Loading customers...</p>
      ) : customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <div style={styles.grid}>
          {customers.map((customer) => (
            <div key={customer._id} style={styles.card}>
              <h3>{customer.name}</h3>
              <p><strong>Phone:</strong> {customer.phone}</p>
              <p><strong>Email:</strong> {customer.email || "N/A"}</p>
              <p><strong>Address:</strong> {customer.address || "N/A"}</p>
              <p><strong>Device:</strong> {customer.deviceType}</p>
              <p><strong>Total Services:</strong> {customer.totalServices}</p>
              <p><strong>Total Revenue:</strong> ${customer.totalRevenue}</p>
              <p>
                <strong>Last Service:</strong>{" "}
                {customer.lastServiceDate
                  ? new Date(customer.lastServiceDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <p>
                <strong>Days Since Last Service:</strong>{" "}
                {customer.daysSinceLastService ?? "N/A"}
              </p>
              <p>
                <strong>Ready to Contact:</strong>{" "}
                {customer.readyToContact ? "Yes" : "No"}
              </p>
              <p>
                <strong>Last Contact Status:</strong>{" "}
                {customer.lastContactStatus || "N/A"}
              </p>
              <p>
                <strong>Last Contacted:</strong>{" "}
                {customer.lastContactedDate
                  ? new Date(customer.lastContactedDate).toLocaleDateString()
                  : "N/A"}
              </p>

              <div style={styles.buttons}>
                <button onClick={() => handleContacted(customer._id)} style={styles.button}>
                  Contacted
                </button>
                <button onClick={() => handleReplied(customer._id)} style={styles.buttonGreen}>
                  Replied
                </button>
                <button onClick={() => handleNoReply(customer._id)} style={styles.buttonGray}>
                  No Reply
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
    maxWidth: "1200px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  buttons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "16px",
  },
  button: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
  buttonGreen: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#28a745",
    color: "#fff",
    cursor: "pointer",
  },
  buttonGray: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#6c757d",
    color: "#fff",
    cursor: "pointer",
  },
};

export default CustomerDashboard;