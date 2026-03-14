import { safetyZones } from "./safetyZones";

// Check if a point lies inside a circle zone
const isInsideZone = (point, zone) => {
  const [lat1, lng1] = point;
  const [lat2, lng2] = zone.center;

  const distance = Math.sqrt(
    Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2)
  );

  return distance < zone.radius / 100000;
};

// Generate 3 possible routes
export const generateRoutes = (start, end) => {
  const mid1 = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
  const mid2 = [mid1[0] + 0.002, mid1[1] - 0.002];
  const mid3 = [mid1[0] - 0.002, mid1[1] + 0.002];

  return [
    [start, end],
    [start, mid2, end],
    [start, mid3, end],
  ];
};

// Score a route
export const scoreRoute = (route) => {
  let high = 0;
  let moderate = 0;

  route.forEach((point) => {
    safetyZones.forEach((zone) => {
      if (isInsideZone(point, zone)) {
        if (zone.risk === "high") high++;
        if (zone.risk === "moderate") moderate++;
      }
    });
  });

  const score = high * 5 + moderate * 2 + route.length;

  return { score, high, moderate };
};

// Pick safest route
export const findSafestRoute = (start, end) => {
  const routes = generateRoutes(start, end);

  let safest = null;
  let bestScore = Infinity;

  routes.forEach((route) => {
    const { score, high, moderate } = scoreRoute(route);

    if (score < bestScore) {
      bestScore = score;
      safest = {
        path: route,
        high,
        moderate,
        score,
      };
    }
  });

  return safest;
};
