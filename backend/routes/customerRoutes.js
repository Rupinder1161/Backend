const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// Get all customers
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    const now = new Date();

    const enrichedCustomers = customers.map((customer) => {
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

    const totalCustomers = customers.length;
    const totalRevenue = customers.reduce(
      (sum, customer) => sum + (customer.totalRevenue || 0),
      0
    );

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const customersServedToday = customers.filter(
      (c) => c.lastServiceDate && new Date(c.lastServiceDate) >= today
    ).length;

    const customersServedThisWeek = customers.filter(
      (c) => c.lastServiceDate && new Date(c.lastServiceDate) >= thisWeekStart
    ).length;

    const customersServedThisMonth = customers.filter(
      (c) => c.lastServiceDate && new Date(c.lastServiceDate) >= thisMonthStart
    ).length;

    const serviceByMonth = {};
    const serviceByWeek = {};
    const serviceByDay = {};

    customers.forEach((customer) => {
      if (!customer.lastServiceDate) return;

      const date = new Date(customer.lastServiceDate);

      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;
      const dayKey = date.toISOString().split("T")[0];

      serviceByMonth[monthKey] = (serviceByMonth[monthKey] || 0) + 1;
      serviceByWeek[weekKey] = (serviceByWeek[weekKey] || 0) + 1;
      serviceByDay[dayKey] = (serviceByDay[dayKey] || 0) + 1;
    });

    function getWeekNumber(date) {
      const oneJan = new Date(date.getFullYear(), 0, 1);
      return Math.ceil((((date - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
    }

    res.json({
      customers: enrichedCustomers,
      insights: {
        totalCustomers,
        totalRevenue,
        customersServedToday,
        customersServedThisWeek,
        customersServedThisMonth,
        serviceByMonth,
        serviceByWeek,
        serviceByDay,
      },
    });
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