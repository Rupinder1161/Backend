const mongoose = require("mongoose");

const referrerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    email: { type: String },
    referralCode: { type: String, required: true, unique: true },

    totalReferrals: { type: Number, default: 0 },
    scheduledReferrals: { type: Number, default: 0 },
    successfulReferrals: { type: Number, default: 0 },
    unsuccessfulReferrals: { type: Number, default: 0 },

    totalRevenue: { type: Number, default: 0 },
    paidOut: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Referrer", referrerSchema);