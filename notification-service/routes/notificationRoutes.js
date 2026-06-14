const express = require("express");
const db = require("../firebase");
const router = express.Router();


router.post("/", async (req, res) => {
  try {
    const { userId, bookingId, message, type } = req.body;

    if (!userId || !message) {
      return res.status(400).json({
        message: "userId and message are required."
      });
    }

    const notificationData = {
      userId: Number(userId),
      bookingId: bookingId || null,
      message,
      type: type || "BOOKING",
      read: false,
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection("notifications").add(notificationData);

    res.status(201).json({
      message: "Notification created successfully.",
      notification: {
        id: docRef.id,
        ...notificationData
      }
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
    const snapshot = await db
      .collection("notifications")
      .orderBy("createdAt", "desc")
      .get();

    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(notifications);
  } catch (err) {
    res.status(500).json({
      message: "Server error.",
      error: err.message
    });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    const snapshot = await db
      .collection("notifications")
      .where("userId", "==", userId)
      .get();

    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(notifications);
  } catch (err) {
    res.status(500).json({
      message: "Server error.",
      error: err.message
    });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const notificationRef = db.collection("notifications").doc(req.params.id);

    await notificationRef.update({
      read: true
    });

    res.json({
      message: "Notification marked as read."
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error.",
      error: err.message
    });
  }
});

module.exports = router;