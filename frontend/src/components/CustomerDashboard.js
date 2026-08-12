import React, { useEffect, useState } from "react";
import axios from "axios";

function CustomerDashboard() {
  const [customers, setCustomers] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/customers`);
        setCustomers(res.data.customers || []);
        setInsights(res.data.insights || null);
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

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(search.toLowerCase()) ||
      customer.email?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "ready") return customer.readyToContact;
    if (filter === "repeat") return customer.totalServices > 1;
    if (filter === "replied") return customer.lastContactStatus === "replied";
    if (filter === "noreply") return customer.lastContactStatus === "no reply";
    return true;
  });

  return (
    <div style={styles.container}>
      <h1>Customer Dashboard</h1>

      {insights && (
        <div style={styles.insightsGrid}>
          <div style={styles.insightCard}>
            <h3>Total Customers</h3>
            <p>{insights.totalCustomers}</p>
          </div>
          <div style={styles.insightCard}>
            <h3>Total Revenue</h3>
            <p>${insights.totalRevenue}</p>
          </div>
          <div style={styles.insightCard}>
            <h3>Served Today</h3>
            <p>{insights.customersServedToday}</p>
          </div>
          <div style={styles.insightCard}>
            <h3>Served This Week</h3>
            <p>{insights.customersServedThisWeek}</p>
          </div>
          <div style={styles.insightCard}>
            <h3>Served This Month</h3>
            <p>{insights.customersServedThisMonth}</p>
          </div>
        </div>
      )}

      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search by name, phone, email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.select}>
          <option value="all">All Customers</option>
          <option value="ready">Ready to Contact</option>
          <option value="repeat">Repeat Customers</option>
          <option value="replied">Replied</option>
          <option value="noreply">No Reply</option>
        </select>
      </div>

      {loading ? (
        <p>Loading customers...</p>
      ) : filteredCustomers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <div style={styles.horizontalList}>
          {filteredCustomers.map((customer) => (
            <div key={customer._id} style={styles.card}>
              <h3>{customer.name}</h3>
              <p><strong>Phone:</strong> {customer.phone}</p>
              <p><strong>Email:</strong> {customer.email || "N/A"}</p>
              <p><strong>Address:</strong> {customer.address || "N/A"}</p>
              <p><strong>Device:</strong> {customer.deviceType}</p>
              <p><strong>Total Services:</strong> {customer.totalServices}</p>
              <p><strong>Total Revenue:</strong> ${customer.totalRevenue}</p>
              <p><strong>Last Service:</strong> {customer.lastServiceDate ? new Date(customer.lastServiceDate).toLocaleDateString() : "N/A"}</p>
              <p><strong>Days Since Last Service:</strong> {customer.daysSinceLastService ?? "N/A"}</p>
              <p><strong>Ready to Contact:</strong> {customer.readyToContact ? "Yes" : "No"}</p>
              <p><strong>Last Contact Status:</strong> {customer.lastContactStatus || "N/A"}</p>
              <p><strong>Last Contacted:</strong> {customer.lastContactedDate ? new Date(customer.lastContactedDate).toLocaleDateString() : "N/A"}</p>

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

      {insights && (
        <div style={styles.insightsGrid}>
          <div style={styles.insightCard}>
            <h3>Served by Month</h3>
            {Object.entries(insights.serviceByMonth).map(([month, count]) => (
              <p key={month}>{month}: {count}</p>
            ))}
          </div>
          <div style={styles.insightCard}>
            <h3>Served by Week</h3>
            {Object.entries(insights.serviceByWeek).map(([week, count]) => (
              <p key={week}>{week}: {count}</p>
            ))}
          </div>
          <div style={styles.insightCard}>
            <h3>Served by Day</h3>
            {Object.entries(insights.serviceByDay).map(([day, count]) => (
              <p key={day}>{day}: {count}</p>
            ))}
          </div>
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
  insightsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },
  insightCard: {
    background: "#fff",
    padding: "18px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  },
  controls: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  search: {
    flex: "1",
    minWidth: "280px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  select: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  horizontalList: {
    display: "flex",
    gap: "16px",
    overflowX: "auto",
    paddingBottom: "12px",
  },
  card: {
    minWidth: "320px",
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    flex: "0 0 auto",
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