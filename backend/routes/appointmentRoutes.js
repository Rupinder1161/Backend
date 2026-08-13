const express = require("express");
const axios = require("axios");
const router = express.Router();

const Appointment = require("../models/Appointment");
const Customer = require("../models/Customer");
// const Referrer = require("../models/Referrer");

// Create appointment
router.post("/", async (req, res) => {
  try {
    const appointmentData = req.body;

    // Auto-link referral code if it exists
    if (appointmentData.referralCode) {
      const referrer = await Referrer.findOne({
        referralCode: appointmentData.referralCode.trim(),
      });

      if (referrer) {
        appointmentData.referrer = referrer._id;
        appointmentData.referralStatus = "referred";
        referrer.totalReferrals += 1;
        await referrer.save();
      }
    }

    const appointment = await Appointment.create(appointmentData);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Address check
router.get("/address-check", async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    const response = await axios.get(
      "https://nominatim.openstreetmap.org/search",
      {
        params: {
          format: "json",
          q: address,
          limit: 1,
        },
        headers: {
          "User-Agent": "SeniorTechJobHub/1.0",
          "Accept-Language": "en",
        },
      }
    );

    const data = response.data;

    if (!data || data.length === 0) {
      return res.json({
        valid: false,
        message: "Address not found",
      });
    }

    res.json({
      valid: true,
      formattedAddress: data[0].display_name,
      lat: data[0].lat,
      lon: data[0].lon,
    });
  } catch (error) {
    console.error("Address check error:", error.message);
    res.status(500).json({
      message: "Failed to check address",
      error: error.message,
    });
  }
});

// Get all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("assignedTech", "name email role")
      .populate("referrer", "name phone email referralCode")
      .sort({ createdAt: -1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get one appointment
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("assignedTech", "name email role")
      .populate("referrer", "name phone email referralCode");

    if (!appointment) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update status
router.put("/:id/status", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate("assignedTech", "name email role")
      .populate("referrer", "name phone email referralCode");

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign tech
router.put("/:id/assign-tech", async (req, res) => {
  try {
    const { techId } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        assignedTech: techId,
        status: "Assigned",
      },
      { new: true }
    )
      .populate("assignedTech", "name email role")
      .populate("referrer", "name phone email referralCode");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get jobs assigned to tech
router.get("/tech/:techId", async (req, res) => {
  try {
    const jobs = await Appointment.find({
      assignedTech: req.params.techId,
      status: { $nin: ["Closed"] },
    })
      .populate("assignedTech", "name email role")
      .populate("referrer", "name phone email referralCode")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start with consent
router.put("/:id/consent", async (req, res) => {
  try {
    const { consentAcceptedByCustomer, consentNotesVersion } = req.body;

    if (!consentAcceptedByCustomer) {
      return res.status(400).json({ message: "Consent is required." });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.consentAcceptedByCustomer = true;
    appointment.consentAcceptedAt = new Date();
    appointment.consentNotesVersion = consentNotesVersion || "v1";
    appointment.status = "In Progress";
    appointment.startTime = new Date();

    await appointment.save();

    res.json({
      message: "Consent saved and job started",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update job
router.put("/:id/job-update", async (req, res) => {
  try {
    const { status, workDone, completionType, finalNotes, needsFollowUp, followUpReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = status || appointment.status;
    appointment.workDone = workDone || appointment.workDone;
    appointment.completionType = completionType || appointment.completionType;
    appointment.finalNotes = finalNotes || appointment.finalNotes;
    appointment.needsFollowUp = needsFollowUp ?? appointment.needsFollowUp;
    appointment.followUpReason = followUpReason || appointment.followUpReason;

    await appointment.save();

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete job
router.put("/:id/complete-job", async (req, res) => {
  try {
    const { workDone, completionType, revenue } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.workDone = workDone || appointment.workDone;
    appointment.completionType = completionType || appointment.completionType;
    appointment.revenue = Number(revenue || appointment.revenue || 0);
    appointment.status =
      completionType === "partial"
        ? "Partially Completed"
        : "Completed";

    appointment.endTime = new Date();

    // Update customer record
    let customer = await Customer.findOne({ phone: appointment.phone });

    if (customer) {
      customer.name = appointment.customerName;
      customer.email = appointment.email;
      customer.address = appointment.address;
      customer.deviceType = appointment.issueType;
      customer.consentToContact = appointment.consentAccepted;
      customer.totalServices += 1;
      customer.totalRevenue += Number(revenue || 0);
      customer.lastServiceDate = new Date();
      customer.active = true;
      await customer.save();
    } else {
      customer = await Customer.create({
        name: appointment.customerName,
        phone: appointment.phone,
        email: appointment.email,
        address: appointment.address,
        deviceType: appointment.issueType,
        consentToContact: appointment.consentAccepted,
        active: true,
        totalServices: 1,
        totalRevenue: Number(revenue || 0),
        lastServiceDate: new Date(),
      });
    }

    // Referral reward logic
    if (
      appointment.referrer &&
      appointment.completionType !== "partial" &&
      !appointment.referralRewardGiven
    ) {
      const referrer = await Referrer.findById(appointment.referrer);

      if (referrer) {
        referrer.successfulReferrals += 1;
        referrer.totalRevenue += 20;
        referrer.balance = referrer.totalRevenue - referrer.paidOut;
        await referrer.save();

        appointment.referralRewardGiven = true;
        appointment.referralStatus = "successful";
      }
    }

    await appointment.save();

    res.json({
      message: "Job completed and records updated",
      appointment,
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Close job
router.put("/:id/close-job", async (req, res) => {
  try {
    const { finalNotes } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.finalNotes = finalNotes || appointment.finalNotes || "";
    appointment.status = "Completed and Closed Successfully";
    appointment.endTime = new Date();

    await appointment.save();

    res.json({
      message: "Job closed successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Archive closed
router.put("/:id/archive", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "Closed" },
      { new: true }
    )
      .populate("assignedTech", "name email role")
      .populate("referrer", "name phone email referralCode");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: "Job archived as closed",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reopen a closed job
router.put("/:id/reopen", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "In Progress" },
      { new: true }
    )
      .populate("assignedTech", "name email role")
      .populate("referrer", "name phone email referralCode");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({
      message: "Job reopened",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add timeline entry
router.put("/:id/timeline", async (req, res) => {
  try {
    const { action, note, createdBy } = req.body;

    if (!action) {
      return res.status(400).json({ message: "Action is required" });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.jobTimeline.push({
      action,
      note: note || "",
      createdBy: createdBy || null,
    });

    await appointment.save();

    res.json({
      message: "Timeline entry added",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;