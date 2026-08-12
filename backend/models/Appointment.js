const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    issueType: {
      type: String,
      enum: ["mobile", "pc", "wifi", "other"],
      required: true,
    },
    issueDescription: { type: String, required: true },
    preferredDate: { type: Date },
    preferredTime: { type: String },
    consentAccepted: { type: Boolean, required: true, default: false },
    consentTextVersion: { type: String, default: "v1" },
    status: {
      type: String,
      enum: [
        "Booked",
        "Scheduled",
        "Assigned",
        "In Progress",
        "Completed",
        "Partially Completed",
        "Needs Feedback",
        "Closed",
        "Cancelled",
      ],
      default: "Booked",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);