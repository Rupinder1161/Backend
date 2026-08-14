const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const Referrer = require("../models/Referrer");
const User = require("../models/User");

// Create referrer + login user
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, referralCode, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required for referrer login" });
    }

    const existingReferrer = await Referrer.findOne({
      $or: [{ referralCode }, { email }],
    });

    if (existingReferrer) {
      return res.status(400).json({ message: "Referrer already exists" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Login user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "referrer",
    });

    const referrer = await Referrer.create({
      userId: user._id,
      name,
      phone,
      email,
      referralCode,
    });

    res.status(201).json({
      message: "Referrer and login user created successfully",
      referrer,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all referrers
router.get("/", async (req, res) => {
  try {
    const referrers = await Referrer.find().populate("userId", "name email role");
    res.json(referrers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get logged-in referrer by user id
router.get("/me/:userId", async (req, res) => {
  try {
    const referrer = await Referrer.findOne({ userId: req.params.userId })
      .populate("userId", "name email role");

    if (!referrer) {
      return res.status(404).json({ message: "Referrer not found" });
    }

    res.json(referrer);
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

// Update payout
router.put("/:id/payout", async (req, res) => {
  try {
    const { paidAmount } = req.body;

    const referrer = await Referrer.findById(req.params.id);
    if (!referrer) {
      return res.status(404).json({ message: "Referrer not found" });
    }

    referrer.paidOut += Number(paidAmount || 0);
    referrer.balance = referrer.totalRevenue - referrer.paidOut;

    await referrer.save();

    res.json(referrer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;