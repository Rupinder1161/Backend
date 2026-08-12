const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    address: { type: String },
    deviceType: {
      type: String,
      enum: ["mobile", "pc", "wifi", "other"],
      default: "other",
    },
    consentToContact: { type: Boolean, default: false },
    active: { type: Boolean, default: true },

    totalServices: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    lastServiceDate: { type: Date },
    lastContactedDate: { type: Date },

    lastContactStatus: {
      type: String,
      enum: ["contacted", "no reply", "replied", ""],
      default: "",
    },

    readyToContact: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", customerSchema);