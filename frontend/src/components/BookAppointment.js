import React, { useState } from "react";
import axios from "axios";
import "./BookAppointment.css";

function BookAppointment() {
  const apiUrl = process.env.REACT_APP_API_URL;

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    issueType: "mobile",
    issueDescription: "",
    referralCode: "",
    preferredDate: "",
    preferredTime: "",
    consentAccepted: false,
  });

  const [message, setMessage] = useState("");
  const [addressCheckMessage, setAddressCheckMessage] = useState("");
  const [addressValid, setAddressValid] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCheckAddress = async () => {
    try {
      if (!formData.address) {
        setAddressCheckMessage("Please enter an address first.");
        setAddressValid(false);
        return;
      }

      setAddressCheckMessage("Checking address...");
      setAddressValid(null);

      const res = await axios.get(`${apiUrl}/api/appointments/address-check`, {
        params: {
          address: formData.address,
        },
      });

      if (res.data.valid) {
        setAddressValid(true);
        setAddressCheckMessage(`Valid address: ${res.data.formattedAddress}`);
      } else {
        setAddressValid(false);
        setAddressCheckMessage(res.data.message || "Address not found");
      }
    } catch (error) {
      console.error(error);
      setAddressValid(false);
      setAddressCheckMessage("Failed to check address.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Submitting...");

    try {
      await axios.post(`${apiUrl}/api/appointments`, formData);
      setMessage("Appointment booked successfully!");
      setFormData({
        customerName: "",
        phone: "",
        email: "",
        address: "",
        issueType: "mobile",
        issueDescription: "",
        referralCode: "",
        preferredDate: "",
        preferredTime: "",
        consentAccepted: false,
      });
      setAddressCheckMessage("");
      setAddressValid(null);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="booking-container">
      <div className="booking-card">
        <h1>Book Appointment</h1>
        <p className="subtitle">
          Fill in the form below to book a SeniorTech service.
        </p>

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-grid">
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
              name="referralCode"
              placeholder="Referral Code (optional)"
              value={formData.referralCode}
              onChange={handleChange}
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
          </div>

          <div className="address-row">
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
              className="address-input"
            />

            <button
              type="button"
              onClick={handleCheckAddress}
              className="check-button"
            >
              Check Address
            </button>
          </div>

          {addressCheckMessage && (
            <p
              className={addressValid === true ? "success-text" : "error-text"}
            >
              {addressCheckMessage}
            </p>
          )}

          <textarea
            name="issueDescription"
            placeholder="Describe the issue"
            value={formData.issueDescription}
            onChange={handleChange}
            required
          />

          <label className="consent-box">
            <input
              type="checkbox"
              name="consentAccepted"
              checked={formData.consentAccepted}
              onChange={handleChange}
              required
            />
            <span>
              I agree that the technician may access my device/network for
              repair purposes and understand data loss may occur. The company
              is not liable for pre-existing issues or data loss during
              troubleshooting.
            </span>
          </label>

          <button type="submit">Submit Booking</button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
}

export default BookAppointment;