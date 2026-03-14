import express from "express";
import { fetchAreaInfrastructure } from "../utils/safetyDataFetcher.js";
import { calculatePointRisk } from "../utils/safetyScorer.js";
import { getRoadRoutes } from "../utils/orsService.js";
import CrimeIncident from "../models/CrimeIncident.js";
import Infrastructure from "../models/Infrastructure.js";


const router = express.Router();

/* ------------------------------------------------ */
/* ROUTE ANALYSIS */
/* ------------------------------------------------ */

router.post("/analyze", async (req, res) => {

  const { start, destination } = req.body;

  if (!start || !destination) {
    return res.status(400).json({ error: "Missing coordinates" });
  }

  try {

    const crimeIncidents = await CrimeIncident.find();

    const routes = await getRoadRoutes(start, destination);

    const analyzedRoutes = [];

    /* -------------------------------
       Calculate bbox for ALL routes
    ------------------------------- */

    const latsAll = [];
    const lngsAll = [];

    routes.forEach(route => {
      route.coords.forEach(point => {
        latsAll.push(point[0]);
        lngsAll.push(point[1]);
      });
    });

    const bbox = [
      Math.min(...latsAll),
      Math.min(...lngsAll),
      Math.max(...latsAll),
      Math.max(...lngsAll)
    ];

    /* -------------------------------
       Fetch infrastructure ONCE
    ------------------------------- */

    const allInfraData = await Infrastructure.find({
  lat: { $gte: bbox[0], $lte: bbox[2] },
  lon: { $gte: bbox[1], $lte: bbox[3] }
});

    /* -------------------------------
       Analyze each route
    ------------------------------- */

    for (let i = 0; i < routes.length; i++) {

      const route = routes[i];
      const coords = route.coords;

      const samples = coords.filter((_, index) => index % 10 === 0);

      let totalRisk = 0;

      for (const point of samples) {

        const lat = point[0];
        const lng = point[1];

        totalRisk += calculatePointRisk(
          allInfraData,
          crimeIncidents,
          lat,
          lng
        );

      }

      const avgRisk = totalRisk / samples.length;

      const safetyScore = Math.round((1 - avgRisk) * 100);

      /* -------------------------------
         Infrastructure indicators
      ------------------------------- */

      const policeNearby = allInfraData.filter(
        e => e.tags?.amenity === "police"
      ).length;

      const lightingCount = allInfraData.filter(
        e => e.tags?.highway === "street_lamp" || e.tags?.lit === "yes"
      ).length;

      const crowdPlaces = allInfraData.filter(
        e => ["restaurant","cafe","marketplace"].includes(e.tags?.amenity)
      ).length;

      const hotels = allInfraData.filter(
        e => e.tags?.tourism === "hotel"
      ).length;

      const hospitals = allInfraData.filter(
        e => e.tags?.amenity === "hospital"
      ).length;

      analyzedRoutes.push({

        id: i + 1,

        coords,

        distance: (route.distance / 1000).toFixed(2),

        time: Math.round(route.duration / 60),

        safetyScore,

        police: policeNearby,

        lighting:
          lightingCount > 20
            ? "Well Lit"
            : lightingCount > 10
            ? "Moderate"
            : "Low Lighting",

        crowd:
          crowdPlaces > 20
            ? "High"
            : crowdPlaces > 10
            ? "Moderate"
            : "Low",

        hotels,
        hospitals,

        riskZones: Math.round(avgRisk * 5)

      });

    }

    res.json({
      success: true,
      routes: analyzedRoutes
    });

  } catch (err) {

    console.error("Analysis Error:", err);

    res.status(500).json({
      success: false,
      error: "Server analysis failed"
    });

  }

});


/* ------------------------------------------------ */
/* SEGMENT RISK ANALYSIS */
/* ------------------------------------------------ */

router.post("/segments", async (req, res) => {

  try {

    const { coords } = req.body;

    if (!coords || coords.length < 2) {
      return res.status(400).json({
        error: "Invalid route coordinates"
      });
    }

    const crimeIncidents = await CrimeIncident.find();

    const lats = coords.map(p => p[0]);
    const lngs = coords.map(p => p[1]);

    const bbox = [
      Math.min(...lats),
      Math.min(...lngs),
      Math.max(...lats),
      Math.max(...lngs)
    ];

    const infra = await fetchAreaInfrastructure(bbox);

    const segments = [];

    for (let i = 0; i < coords.length - 1; i++) {

      const start = coords[i];
      const end = coords[i + 1];

      const midLat = (start[0] + end[0]) / 2;
      const midLng = (start[1] + end[1]) / 2;

      const risk = calculatePointRisk(
        infra,
        crimeIncidents,
        midLat,
        midLng
      );

      segments.push({
        coords: [start, end],
        risk
      });

    }

    res.json({
      success: true,
      segments
    });

  } catch (err) {

    console.error("Segment Error:", err);

    res.status(500).json({
      success: false,
      error: "Segment analysis failed"
    });

  }

});

export default router;