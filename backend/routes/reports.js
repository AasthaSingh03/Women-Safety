import express from "express";
import SafetyReport from "../models/SafetyReport.js";

const router = express.Router();

// Submit a report
router.post("/", async (req, res) => {
  try {
    const { lat, lon, issues, severity, routeId, note } = req.body;
    if (!lat || !lon || !issues?.length)
      return res.status(400).json({ error: "Missing required fields" });

    const report = await SafetyReport.create({ lat, lon, issues, severity, routeId, note });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get reports near a location
router.get("/nearby", async (req, res) => {
  try {
    const { lat, lon, radius = 500 } = req.query;

    // Time decay — only last 3 days
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const reports = await SafetyReport.find({
      timestamp: { $gte: threeDaysAgo },
      lat: { $gte: parseFloat(lat) - 0.05, $lte: parseFloat(lat) + 0.05 },
      lon: { $gte: parseFloat(lon) - 0.05, $lte: parseFloat(lon) + 0.05 },
    });

    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all reports for map display (bbox)
router.get("/bbox", async (req, res) => {
  try {
    const { minLat, maxLat, minLon, maxLon } = req.query;
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const reports = await SafetyReport.find({
      timestamp: { $gte: threeDaysAgo },
      lat: { $gte: parseFloat(minLat), $lte: parseFloat(maxLat) },
      lon: { $gte: parseFloat(minLon), $lte: parseFloat(maxLon) },
    });

    res.json({ success: true, reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;