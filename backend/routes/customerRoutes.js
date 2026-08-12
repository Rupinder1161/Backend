const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// Get all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    const updatedCustomers = customers.map((customer) => {
      let readyToContact = false;
      let daysSinceLastService = null;

      if (customer.lastServiceDate) {
        const days =
          (Date.now() - new Date(customer.lastServiceDate)) /
          (1000 * 60 * 60 * 24);

        daysSinceLastService = Math.floor(days);
        readyToContact = days > 30;
      }

      return {
        ...customer.toObject(),
        daysSinceLastService,
        readyToContact,
      };
    });

    res.json(updatedCustomers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark customer as contacted
router.put("/:id/contacted", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        lastContactedDate: new Date(),
        lastContactStatus: "contacted",
      },
      { new: true }
    );

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark customer as replied
router.put("/:id/replied", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        lastContactedDate: new Date(),
        lastContactStatus: "replied",
      },
      { new: true }
    );

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark customer as no reply
router.put("/:id/noreply", async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        lastContactedDate: new Date(),
        lastContactStatus: "no reply",
      },
      { new: true }
    );

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;