const express = require("express");
const cors = require("cors");
require("dotenv").config();

const clubRoutes = require("./routes/clubRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/clubs", clubRoutes);

app.get("/", (req, res) => {
  res.send("Club Service is running");
});

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`Club Service running on port ${PORT}`);
});