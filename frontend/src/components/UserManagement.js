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
  const [passwordUpdates, setPasswordUpdates] = useState({});
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showResetPasswords, setShowResetPasswords] = useState({});
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
      setShowCreatePassword(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to create user.");
    }
  };

  const handlePasswordChange = (userId, value) => {
    setPasswordUpdates({
      ...passwordUpdates,
      [userId]: value,
    });
  };

  const handlePasswordReset = async (userId) => {
    try {
      const newPassword = passwordUpdates[userId];

      if (!newPassword) {
        setMessage("Please enter a new password.");
        return;
      }

      await axios.put(`${apiUrl}/api/auth/users/${userId}/password`, {
        password: newPassword,
      });

      setMessage("Password updated successfully!");
      setPasswordUpdates({
        ...passwordUpdates,
        [userId]: "",
      });
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to update password.");
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      await axios.put(`${apiUrl}/api/auth/users/${userId}/deactivate`);
      setMessage("User deactivated successfully!");
      fetchUsers();
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to deactivate user.");
    }
  };

  const toggleResetVisibility = (userId) => {
    setShowResetPasswords({
      ...showResetPasswords,
      [userId]: !showResetPasswords[userId],
    });
  };

  return (
    <div style={styles.container}>
      <h1>Team Member Management</h1>

      <div style={styles.card}>
        <div style={styles.sectionHeader}>
          <h2 style={{ margin: 0 }}>Create User</h2>
          <button
            type="button"
            onClick={() => setShowCreatePassword(!showCreatePassword)}
            style={styles.smallButton}
          >
            {showCreatePassword ? "Hide Password" : "Show Password"}
          </button>
        </div>

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
            type={showCreatePassword ? "text" : "password"}
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

        {message && <p style={{ marginTop: "12px" }}>{message}</p>}
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
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Reset Password</th>
                <th style={styles.th}>Actions</th>
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
                    <span style={user.active ? styles.activeBadge : styles.inactiveBadge}>
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.passwordResetBox}>
                      {showResetPasswords[user._id] ? (
                        <input
                          type="text"
                          placeholder="New password"
                          value={passwordUpdates[user._id] || ""}
                          onChange={(e) =>
                            handlePasswordChange(user._id, e.target.value)
                          }
                          style={styles.passwordInput}
                        />
                      ) : (
                        <input
                          type="password"
                          placeholder="New password"
                          value={passwordUpdates[user._id] || ""}
                          onChange={(e) =>
                            handlePasswordChange(user._id, e.target.value)
                          }
                          style={styles.passwordInput}
                        />
                      )}

                      <button
                        type="button"
                        onClick={() => toggleResetVisibility(user._id)}
                        style={styles.smallButton}
                      >
                        {showResetPasswords[user._id] ? "Hide" : "Show"}
                      </button>

                      <button
                        onClick={() => handlePasswordReset(user._id)}
                        style={styles.resetButton}
                        type="button"
                      >
                        Update
                      </button>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleDeactivate(user._id)}
                      style={styles.deactivateButton}
                      type="button"
                    >
                      Deactivate
                    </button>
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
    maxWidth: "1300px",
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
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
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
  smallButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    background: "#6c757d",
    color: "#fff",
    cursor: "pointer",
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
    verticalAlign: "middle",
  },
  rowLight: {
    backgroundColor: "#f8fbff",
  },
  rowWhite: {
    backgroundColor: "#ffffff",
  },
  passwordResetBox: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  passwordInput: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    minWidth: "180px",
  },
  resetButton: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#dc3545",
    color: "#fff",
    cursor: "pointer",
  },
  deactivateButton: {
    padding: "10px 14px",
    border: "none",
    borderRadius: "8px",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
  activeBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "12px",
    fontWeight: "600",
  },
  inactiveBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: "12px",
    fontWeight: "600",
  },
};

export default UserManagement;