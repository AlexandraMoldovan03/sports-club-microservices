const express = require("express");
const axios = require("axios");
const Booking = require("../models/Booking");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, clubId, courtId, date, startTime, endTime } = req.body;

    if (!userId || !clubId || !courtId || !date || !startTime || !endTime) {
      return res.status(400).json({
        message: "All fields are required."
      });
    }

    const existingBooking = await Booking.findOne({
      courtId,
      date,
      status: "CONFIRMED",
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "This court is already booked for this time interval."
      });
    }

    const booking = await Booking.create({
      userId,
      clubId,
      courtId,
      date,
      startTime,
      endTime
    });
    try {
  await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/api/notifications`, {
    userId,
    bookingId: booking._id.toString(),
    message: `Rezervarea pentru terenul ${courtId} din data ${date}, între ${startTime} și ${endTime}, a fost confirmată.`,
    type: "BOOKING"
  });
} catch (notificationError) {
  console.error("Notification Service error:", notificationError.message);
}
    res.status(201).json({
      message: "Booking created successfully.",
      booking
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error.",
      error: err.message
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      message: "Server error.",
      error: err.message
    });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: Number(req.params.userId)
    }).sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      message: "Server error.",
      error: err.message
    });
  }
});

module.exports = router;