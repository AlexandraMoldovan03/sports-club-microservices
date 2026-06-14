const express = require("express");
const cors = require("cors");
require("dotenv").config();

require("./firebase");

const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("Notification Service with Firebase Firestore is running");
});

const PORT = process.env.PORT || 4004;

app.listen(PORT, () => {
  console.log(`Notification Service running on port ${PORT}`);
});