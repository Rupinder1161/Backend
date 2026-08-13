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
    "Needs Feedback",
    "Completed",
    "Completed and Closed Successfully",
    "Closed",
    "Cancelled",
  ],
  default: "Booked",
},
    workDone: { type: String, default: "" },
    completionType: {
      type: String,
      enum: ["completed", "partial", ""],
      default: "",
    },
    feedbackRating: { type: Number, min: 1, max: 5, default: null },
feedbackComment: { type: String, default: "" },
feedbackSubmitted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);