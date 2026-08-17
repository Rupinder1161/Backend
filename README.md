router.put("/:id/feedback", async (req, res) => {
  try {
    const { feedbackRating, feedbackComment } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.feedbackRating = feedbackRating;
    appointment.feedbackComment = feedbackComment;
    appointment.feedbackSubmitted = true;

    // Optional: update status if needed
    if (appointment.status === "Completed and Closed Successfully") {
      appointment.status = "Needs Feedback";
    }

    await appointment.save();

    res.json({
      message: "Feedback submitted successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
