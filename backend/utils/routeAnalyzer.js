import { safetyZones } from "./safetyZones";

// Haversine distance in KM
function haversine(p1, p2) {
  const R = 6371;
  const dLat = ((p2[0] - p1[0]) * Math.PI) / 180;
  const dLng = ((p2[1] - p1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1[0] * Math.PI) / 180) *
      Math.cos((p2[0] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function isInsideZone(point, zone) {
  const [lat1, lng1] = point;
  const [lat2, lng2] = zone.center;
  const dist =
    Math.sqrt((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2) * 111000;
  return dist <= zone.radius;
}

export function analyzeRoute(route) {
  let high = 0;
  let moderate = 0;
  let safe = 0;
  let totalDistance = 0;

  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += haversine(route[i], route[i + 1]);
  }

  route.forEach((point) => {
    safetyZones.forEach((zone) => {
      if (isInsideZone(point, zone)) {
        if (zone.risk === "high") high++;
        else if (zone.risk === "moderate") moderate++;
        else safe++;
      }
    });
  });

  let score = 100 - high * 30 - moderate * 15;
  score = Math.max(0, Math.min(100, score));

  let riskLevel = "Low";
  if (score < 40) riskLevel = "High";
  else if (score < 70) riskLevel = "Moderate";

  const time = Math.round((totalDistance / 4) * 60);

  return {
    distance: totalDistance.toFixed(2),
    time,
    high,
    moderate,
    safe,
    score,
    riskLevel,
  };
}
