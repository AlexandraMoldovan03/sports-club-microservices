const express = require("express");
const pool = require("../db");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, location, description, owner_id } = req.body;

    if (!name || !location || !owner_id) {
      return res.status(400).json({
        message: "Name, location and owner_id are required."
      });
    }

    const result = await pool.query(
      "INSERT INTO clubs (name, location, description, owner_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, location, description || null, owner_id]
    );

    res.status(201).json({
      message: "Club created successfully.",
      club: result.rows[0]
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
    const result = await pool.query("SELECT * FROM clubs ORDER BY id ASC");

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: "Server error.",
      error: err.message
    });
  }
});

router.post("/:clubId/courts", async (req, res) => {
  try {
    const { clubId } = req.params;
    const { name, sport_type, price_per_hour } = req.body;

    if (!name || !sport_type || !price_per_hour) {
      return res.status(400).json({
        message: "Name, sport_type and price_per_hour are required."
      });
    }

    const result = await pool.query(
      "INSERT INTO courts (club_id, name, sport_type, price_per_hour) VALUES ($1, $2, $3, $4) RETURNING *",
      [clubId, name, sport_type, price_per_hour]
    );

    res.status(201).json({
      message: "Court created successfully.",
      court: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error.",
      error: err.message
    });
  }
});

router.get("/:clubId/courts", async (req, res) => {
  try {
    const { clubId } = req.params;

    const result = await pool.query(
      "SELECT * FROM courts WHERE club_id = $1 ORDER BY id ASC",
      [clubId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      message: "Server error.",
      error: err.message
    });
  }
});

module.exports = router;