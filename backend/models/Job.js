const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    technicianName: { type: String },
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
    workDone: { type: String },
    completionType: {
      type: String,
      enum: ["completed", "partial"],
    },
    customerFeedback: { type: String },
    customerRating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);