import express from "express";
import { calculatePointRisk } from "../utils/safetyScorer.js";
import { getRoadRoutes } from "../utils/orsService.js";
import CrimeIncident from "../models/CrimeIncident.js";
import SafetyReport from "../models/SafetyReport.js";
import { fetchInfrastructureForArea } from "../scripts/importInfrastructure.js";

const router = express.Router();

const quickDist = (lat1, lon1, lat2, lon2) => {
  const dLat = (lat2 - lat1) * 111000;
  const dLon = (lon2 - lon1) * 111000 * Math.cos(lat1 * Math.PI / 180);
  return Math.sqrt(dLat * dLat + dLon * dLon);
};

const getAutoZone = () => {
  const h = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  ).getHours();
  if (h >= 23 || h < 6) return "night";
  if (h >= 17) return "evening";
  return "day";
};

const crowdLabel = (avgCrowd, timeZone) => {
  if (timeZone === "day")     return avgCrowd > 8 ? "High" : avgCrowd > 3 ? "Moderate" : "Likely Low";
  if (timeZone === "evening") return avgCrowd > 8 ? "Very High" : avgCrowd > 3 ? "High" : "Moderate";
  return avgCrowd > 8 ? "Moderate" : avgCrowd > 3 ? "Low" : "Very Low";
};

const lightingLabel = (avgLights, timeZone) => {
  if (timeZone === "day") return "Natural Light";
  if (timeZone === "evening") return avgLights > 5 ? "Well Lit" : avgLights > 2 ? "Moderate" : "Dim";
  return avgLights > 5 ? "Well Lit" : avgLights > 2 ? "Moderate" : "Dark";
};

router.post("/analyze", async (req, res) => {

  const { start, destination, timeZone } = req.body;
  if (!start || !destination)
    return res.status(400).json({ error: "Missing coordinates" });

  try {

    const zone = timeZone || getAutoZone();
    console.log(`Zone: ${zone}`);

    const crimeIncidents = await CrimeIncident.find();
    const routes = await getRoadRoutes(start, destination);

    const latsAll = [], lngsAll = [];
    routes.forEach(r => r.coords.forEach(([lat, lng]) => {
      latsAll.push(lat); lngsAll.push(lng);
    }));
    const bbox = [
      Math.min(...latsAll) - 0.01, Math.min(...lngsAll) - 0.01,
      Math.max(...latsAll) + 0.01, Math.max(...lngsAll) + 0.01
    ];

    const allInfraData = await fetchInfrastructureForArea(bbox);

    // Community reports — last 3 days only
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const communityReports = await SafetyReport.find({
      timestamp: { $gte: threeDaysAgo },
      lat: { $gte: bbox[0], $lte: bbox[2] },
      lon: { $gte: bbox[1], $lte: bbox[3] },
    });
    console.log("Infra:", allInfraData.length, "| Crimes:", crimeIncidents.length, "| Reports:", communityReports.length);

    const analyzedRoutes = [];

    for (let i = 0; i < routes.length; i++) {

      const route   = routes[i];
      const coords  = route.coords;
      const samples = coords.filter((_, idx) => idx % 10 === 0);

      let totalRisk = 0;
      let totalPolice = 0, totalLights = 0, totalCrowd = 0;

      for (const [lat, lng] of samples) {

        totalRisk += calculatePointRisk(
          allInfraData, crimeIncidents, lat, lng, zone, communityReports
        );

        const nearby = allInfraData.filter(item =>
          item.lat && item.lon && quickDist(lat, lng, item.lat, item.lon) < 300
        );

        totalPolice += nearby.filter(e => e.tags?.amenity === "police").length;
        totalLights += nearby.filter(e =>
          e.tags?.highway === "street_lamp" ||
          e.tags?.lit === "yes" || e.tags?.lit === "24/7"
        ).length;
        totalCrowd += nearby.filter(e =>
          ["restaurant","cafe","marketplace","fast_food","bar","pub","college","university","supermarket"]
            .includes(e.tags?.amenity || e.tags?.shop)
        ).length;
      }

      const avgRisk     = totalRisk    / samples.length;
      const safetyScore = Math.round((1 - avgRisk) * 100);
      const avgPolice   = Math.round(totalPolice / samples.length);
      const avgLights   = Math.round(totalLights / samples.length);
      const avgCrowd    = Math.round(totalCrowd  / samples.length);

      const hotels    = allInfraData.filter(e => e.tags?.tourism === "hotel" || e.tags?.tourism === "hostel").length;
      const hospitals = allInfraData.filter(e => e.tags?.amenity === "hospital").length;
      const riskMultiplier = zone === "night" ? 1.5 : zone === "evening" ? 1.2 : 1.0;

      // Check if community reports affect this route
      const hasReports = communityReports.some(r =>
        coords.some(([lat, lng]) => quickDist(lat, lng, r.lat, r.lon) < 200)
      );

      analyzedRoutes.push({
        id: i + 1, coords,
        distance:   (route.distance / 1000).toFixed(2),
        time:       Math.round(route.duration / 60),
        safetyScore, timeZone: zone,
        police:     avgPolice,
        lighting:   lightingLabel(avgLights, zone),
        crowd:      crowdLabel(avgCrowd, zone),
        hotels, hospitals,
        riskZones:  Math.round(avgRisk * riskMultiplier * 5),
        hasReports,   // ← flag for frontend warning
      });
    }

    res.json({ success: true, routes: analyzedRoutes });

  } catch (err) {
    console.error("Analysis Error:", err);
    res.status(500).json({ success: false, error: "Server analysis failed" });
  }
});


router.post("/segments", async (req, res) => {

  try {

    const { coords, timeZone } = req.body;
    if (!coords || coords.length < 2)
      return res.status(400).json({ error: "Invalid coordinates" });

    const zone = timeZone || getAutoZone();
    const crimeIncidents = await CrimeIncident.find();

    const lats = coords.map(p => p[0]);
    const lngs = coords.map(p => p[1]);
    const bbox = [
      Math.min(...lats) - 0.01, Math.min(...lngs) - 0.01,
      Math.max(...lats) + 0.01, Math.max(...lngs) + 0.01
    ];

    const infra = await fetchInfrastructureForArea(bbox);

    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const communityReports = await SafetyReport.find({
      timestamp: { $gte: threeDaysAgo },
      lat: { $gte: bbox[0], $lte: bbox[2] },
      lon: { $gte: bbox[1], $lte: bbox[3] },
    });

    const segments = [];
    for (let i = 0; i < coords.length - 1; i++) {
      const [sLat, sLng] = coords[i];
      const [eLat, eLng] = coords[i + 1];
      const risk = calculatePointRisk(
        infra, crimeIncidents,
        (sLat + eLat) / 2, (sLng + eLng) / 2,
        zone, communityReports
      );
      segments.push({ coords: [coords[i], coords[i + 1]], risk });
    }

    res.json({ success: true, segments });

  } catch (err) {
    console.error("Segment Error:", err);
    res.status(500).json({ success: false, error: "Segment analysis failed" });
  }
});

export default router;