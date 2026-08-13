const express = require("express");
const router = express.Router();
const Referrer = require("../models/Referrer");
const Appointment = require("../models/Appointment");

// Create referrer
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, referralCode } = req.body;

    const existing = await Referrer.findOne({ referralCode });
    if (existing) {
      return res.status(400).json({ message: "Referral code already exists" });
    }

    const referrer = await Referrer.create({
      name,
      phone,
      email,
      referralCode,
    });

    res.status(201).json(referrer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all referrers with stats
router.get("/", async (req, res) => {
  try {
    const referrers = await Referrer.find().sort({ createdAt: -1 });
    res.json(referrers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get referrer by code
router.get("/code/:code", async (req, res) => {
  try {
    const referrer = await Referrer.findOne({ referralCode: req.params.code });
    if (!referrer) {
      return res.status(404).json({ message: "Referrer not found" });
    }

    res.json(referrer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update referrer stats when referral becomes successful
router.put("/:id/success", async (req, res) => {
  try {
    const referrer = await Referrer.findById(req.params.id);
    if (!referrer) {
      return res.status(404).json({ message: "Referrer not found" });
    }

    referrer.successfulReferrals += 1;
    referrer.totalRevenue += 20;
    referrer.balance = referrer.totalRevenue - referrer.paidOut;

    await referrer.save();

    res.json(referrer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;