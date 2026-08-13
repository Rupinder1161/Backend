const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Customer = require("../models/Customer");

// Create appointment
router.post("/", async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get one appointment
router.get("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Not found" });
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
    );
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/job-update", async (req, res) => {
  try {
    const { status, workDone, completionType } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, workDone, completionType },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put("/:id/feedback", async (req, res) => {
  try {
    const { feedbackRating, feedbackComment } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        feedbackRating,
        feedbackComment,
        feedbackSubmitted: true,
        status: "Closed",
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//customer route
router.put("/:id/complete-job", async (req, res) => {
  try {
    const { workDone, completionType, revenue } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.status = completionType === "partial" ? "Partially Completed" : "Completed";
    appointment.workDone = workDone;
    appointment.completionType = completionType;
    await appointment.save();

    // Update or create customer
    const serviceDate = new Date();

    let customer = await Customer.findOne({ phone: appointment.phone });

    if (customer) {
      customer.name = appointment.customerName;
      customer.email = appointment.email;
      customer.address = appointment.address;
      customer.deviceType = appointment.issueType;
      customer.consentToContact = appointment.consentAccepted;
      customer.totalServices += 1;
      customer.totalRevenue += Number(revenue || 0);
      customer.lastServiceDate = serviceDate;
      customer.active = true;

      // mark ready to contact if last service is older than 30 days
      customer.readyToContact = false;

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
        lastServiceDate: serviceDate,
        readyToContact: false,
      });
    }

    res.json({
      message: "Job completed and customer record updated",
      appointment,
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/customers/all", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    const updatedCustomers = customers.map((customer) => {
      let readyToContact = false;
      let daysSinceLastService = null;

      if (customer.lastServiceDate) {
        daysSinceLastService =
          (Date.now() - new Date(customer.lastServiceDate)) /
          (1000 * 60 * 60 * 24);

        readyToContact = daysSinceLastService > 30;
      }

      return {
        ...customer.toObject(),
        daysSinceLastService: daysSinceLastService
          ? Math.floor(daysSinceLastService)
          : null,
        readyToContact,
      };
    });

    res.json(updatedCustomers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/complete-job", async (req, res) => {
  try {
    const { workDone, completionType, revenue } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Update appointment/job info
    appointment.workDone = workDone;
    appointment.completionType = completionType;
    appointment.status =
      completionType === "partial" ? "Partially Completed" : "Completed";

    await appointment.save();

    // Create or update customer
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

    res.json({
      message: "Job completed and customer record updated",
      appointment,
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Close job properly
router.put("/:id/close-job", async (req, res) => {
  try {
    const { finalNotes } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.finalNotes = finalNotes || appointment.finalNotes || "";
    appointment.status = "Completed and Closed Successfully";

    await appointment.save();

    res.json({
      message: "Job closed successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fully archive as closed
router.put("/:id/archive", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "Closed" },
      { new: true }
    );

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
    );

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
// Get jobs assigned to a tech
router.get("/tech/:techId", async (req, res) => {
  try {
    const jobs = await Appointment.find({
      assignedTech: req.params.techId,
      status: { $ne: "Closed" },
    }).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put("/:id/start-job", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        status: "In Progress",
        startTime: new Date(),
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
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
    ).populate("assignedTech", "name email role");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put("/:id/start-with-consent", async (req, res) => {
  try {
    const { consentAcceptedByCustomer, consentNotesVersion } = req.body;

    if (!consentAcceptedByCustomer) {
      return res.status(400).json({ message: "Customer must accept consent before starting the job." });
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
      message: "Job started with customer consent",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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

router.get("/address-check", async (req, res) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );

    const data = await response.json();

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
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;