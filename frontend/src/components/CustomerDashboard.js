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

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.select}
        >
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
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.headerCell}>Name</th>
                <th style={styles.headerCell}>Phone</th>
                <th style={styles.headerCell}>Email</th>
                <th style={styles.headerCell}>Address</th>
                <th style={styles.headerCell}>Device</th>
                <th style={styles.headerCell}>Total Services</th>
                <th style={styles.headerCell}>Total Revenue</th>
                <th style={styles.headerCell}>Last Service</th>
                <th style={styles.headerCell}>Days Since</th>
                <th style={styles.headerCell}>Ready?</th>
                <th style={styles.headerCell}>Last Contact</th>
                <th style={styles.headerCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr
                  key={customer._id}
                  style={index % 2 === 0 ? styles.rowLight : styles.rowWhite}
                >
                  <td style={styles.cell}>{customer.name}</td>
                  <td style={styles.cell}>{customer.phone}</td>
                  <td style={styles.cell}>{customer.email || "N/A"}</td>
                  <td style={styles.cell}>{customer.address || "N/A"}</td>
                  <td style={styles.cell}>{customer.deviceType}</td>
                  <td style={styles.cell}>{customer.totalServices}</td>
                  <td style={styles.cell}>${customer.totalRevenue}</td>
                  <td style={styles.cell}>
                    {customer.lastServiceDate
                      ? new Date(customer.lastServiceDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td style={styles.cell}>
                    {customer.daysSinceLastService ?? "N/A"}
                  </td>
                  <td style={styles.cell}>
                    {customer.readyToContact ? "Yes" : "No"}
                  </td>
                  <td style={styles.cell}>
                    {customer.lastContactStatus || "N/A"}
                    <br />
                    {customer.lastContactedDate
                      ? new Date(customer.lastContactedDate).toLocaleDateString()
                      : ""}
                  </td>
                  <td style={styles.cell}>
                    <div style={styles.buttons}>
                      <button
                        onClick={() => handleContacted(customer._id)}
                        style={styles.button}
                      >
                        Contacted
                      </button>
                      <button
                        onClick={() => handleReplied(customer._id)}
                        style={styles.buttonGreen}
                      >
                        Replied
                      </button>
                      <button
                        onClick={() => handleNoReply(customer._id)}
                        style={styles.buttonGray}
                      >
                        No Reply
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {insights && (
        <div style={styles.insightsGrid}>
          <div style={styles.insightCard}>
            <h3>Served by Month</h3>
            {Object.entries(insights.serviceByMonth).map(([month, count]) => (
              <p key={month}>
                {month}: {count}
              </p>
            ))}
          </div>
          <div style={styles.insightCard}>
            <h3>Served by Week</h3>
            {Object.entries(insights.serviceByWeek).map(([week, count]) => (
              <p key={week}>
                {week}: {count}
              </p>
            ))}
          </div>
          <div style={styles.insightCard}>
            <h3>Served by Day</h3>
            {Object.entries(insights.serviceByDay).map(([day, count]) => (
              <p key={day}>
                {day}: {count}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1600px",
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
  tableWrapper: {
    overflowX: "auto",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "8px",
    marginBottom: "24px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "1200px",
  },
  headerCell: {
    padding: "14px 12px",
    background: "#f3f4f6",
    borderBottom: "2px solid #d1d5db",
    textAlign: "left",
    whiteSpace: "nowrap",
  },
  cell: {
    padding: "14px 12px",
    borderBottom: "1px solid #e5e7eb",
    verticalAlign: "top",
  },
  rowLight: {
    backgroundColor: "#f8fbff",
  },
  rowWhite: {
    backgroundColor: "#ffffff",
  },
  buttons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  button: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    background: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
  buttonGreen: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    background: "#28a745",
    color: "#fff",
    cursor: "pointer",
  },
  buttonGray: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    background: "#6c757d",
    color: "#fff",
    cursor: "pointer",
  },
};

export default CustomerDashboard;