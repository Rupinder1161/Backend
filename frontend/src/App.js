import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    issueType: "mobile",
    issueDescription: "",
    preferredDate: "",
    preferredTime: "",
    consentAccepted: false,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      await axios.post(`${apiUrl}/api/appointments`, formData);
      setMessage("Appointment booked successfully!");
      setFormData({
        customerName: "",
        phone: "",
        email: "",
        address: "",
        issueType: "mobile",
        issueDescription: "",
        preferredDate: "",
        preferredTime: "",
        consentAccepted: false,
      });
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="container">
      <h1>Job Appointment Booking</h1>

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="customerName"
          placeholder="Customer Name"
          value={formData.customerName}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />

        <select
          name="issueType"
          value={formData.issueType}
          onChange={handleChange}
        >
          <option value="mobile">Mobile</option>
          <option value="pc">PC</option>
          <option value="wifi">WiFi</option>
          <option value="other">Other</option>
        </select>

        <textarea
          name="issueDescription"
          placeholder="Describe the issue"
          value={formData.issueDescription}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="preferredDate"
          value={formData.preferredDate}
          onChange={handleChange}
        />

        <input
          type="time"
          name="preferredTime"
          value={formData.preferredTime}
          onChange={handleChange}
        />

        <label className="checkbox">
          <input
            type="checkbox"
            name="consentAccepted"
            checked={formData.consentAccepted}
            onChange={handleChange}
            required
          />
          I agree that the technician may access my device/network for repair
          purposes and understand data loss may occur. The company is not liable
          for pre-existing issues or data loss during troubleshooting.
        </label>

        <button type="submit">Book Appointment</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default App;