// import { safetyZones } from "./safetyZones";

// /*
//   This function analyzes how risky a route is
//   route: [[lat, lng], [lat, lng]]
//   safetyZones: array of circles with center, radius, risk
// */
// export function analyzeRouteSafety(route) {
//   let high = 0;
//   let moderate = 0;
//   let safe = 0;

//   if (!route || route.length !== 2) {
//     return {
//       high: 0,
//       moderate: 0,
//       safe: 0,
//       riskLevel: "Unknown",
//       avoided: 0,
//       distance: 0,
//       time: 0,
//     };
//   }

//   const [start, end] = route;

//   safetyZones.forEach((zone) => {
//     const intersects = lineIntersectsCircle(start, end, zone.center, zone.radius);

//     if (intersects) {
//       if (zone.risk === "high") high++;
//       else if (zone.risk === "moderate") moderate++;
//       else safe++;
//     }
//   });

//   let riskLevel = "Low Risk";

//   if (high >= 3) riskLevel = "High Risk";
//   else if (high >= 1 || moderate >= 2) riskLevel = "Moderate Risk";

//   return {
//     high,
//     moderate,
//     safe,
//     riskLevel,
//     avoided: high,
//     distance: 1.8,   // dummy for now
//     time: 25,        // dummy for now
//   };
// }

// /*
//   Check if a line segment intersects a circle
// */
// function lineIntersectsCircle(p1, p2, center, radius) {
//   const toRad = (x) => (x * Math.PI) / 180;

//   // Approx conversion: lat/lng → meters
//   const latFactor = 111000;
//   const lngFactor = 111000 * Math.cos(toRad(center[0]));

//   const x1 = (p1[1] - center[1]) * lngFactor;
//   const y1 = (p1[0] - center[0]) * latFactor;
//   const x2 = (p2[1] - center[1]) * lngFactor;
//   const y2 = (p2[0] - center[0]) * latFactor;

//   const dx = x2 - x1;
//   const dy = y2 - y1;

//   const a = dx * dx + dy * dy;
//   const b = 2 * (x1 * dx + y1 * dy);
//   const c = x1 * x1 + y1 * y1 - radius * radius;

//   const discriminant = b * b - 4 * a * c;

//   return discriminant >= 0;
// }


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
