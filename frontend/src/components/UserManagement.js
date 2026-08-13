import React, { useEffect, useState } from "react";
import axios from "axios";

function UserManagement() {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "tech",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiUrl}/api/auth/users`);
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Creating user...");

    try {
      await axios.post(`${apiUrl}/api/auth/register`, formData);
      setMessage("User created successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "tech",
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message || "Failed to create user."
      );
    }
  };

  return (
    <div style={styles.container}>
      <h1>Team Member Management</h1>

      <div style={styles.card}>
        <h2>Create User</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
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
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="tech">Tech</option>
            <option value="seniorTech">Senior Tech</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" style={styles.button}>
            Create User
          </button>
        </form>

        {message && <p>{message}</p>}
      </div>

      <div style={styles.card}>
        <h2>Existing Users</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr
                  key={user._id}
                  style={index % 2 === 0 ? styles.rowLight : styles.rowWhite}
                >
                  <td style={styles.td}>{user.name}</td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>{user.role}</td>
                  <td style={styles.td}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
    fontSize: "16px",
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

export default UserManagement;