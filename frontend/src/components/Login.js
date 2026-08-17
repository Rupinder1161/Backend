import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Logging in...");

    try {
      const res = await axios.post(`${apiUrl}/api/auth/login`, {
        email,
        password,
      });

      login(res.data.user, res.data.token);

      setMessage("Login successful!");
      const role = res.data.user.role?.trim().toLowerCase();

      if (role === "admin" || role === "seniorTech") {
        navigate("/");
      } else if (role === "tech"){
        navigate("/tech");
      } else if (role === "referrer"){
        navigate ("/referrer-dashboard")               
      }
      else{
        navigate("/login")
      }
    } catch (error) {
      console.error(error);
      setMessage("Invalid login credentials.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>SeniorTech Job Hub</h1>
        <p>Login to continue</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
    fontFamily: "Arial, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "20px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#007bff",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Login;