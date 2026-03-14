import express from "express";
import SafetyZone from "../models/SafetyZone.js";

const router = express.Router();

// GET all safety zones
router.get("/", async (req, res) => {
  try {
    const zones = await SafetyZone.find();
    res.json({
      success: true,
      zones,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch safety zones" });
  }
});

export default router;
