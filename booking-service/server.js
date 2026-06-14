const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/bookings", bookingRoutes);

app.get("/", (req, res) => {
  res.send("Booking Service is running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");

    app.listen(process.env.PORT || 4003, () => {
      console.log(`Booking Service running on port ${process.env.PORT || 4003}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });