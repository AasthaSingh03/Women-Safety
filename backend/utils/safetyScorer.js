const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const calculatePointRisk = (allInfra, crimeIncidents, lat, lon, timeZone = "day") => {

  const radius = 400;

  const nearby = allInfra.filter(item => {
    if (!item.lat || !item.lon) return false;
    return getDistance(lat, lon, item.lat, item.lon) < radius;
  });

  // ── Static OSM counts (never change across modes) ──
  const lampCount   = nearby.filter(e =>
    e.tags?.highway === "street_lamp" ||
    e.tags?.lit === "yes" || e.tags?.lit === "24/7"
  ).length;

  const policeCount = nearby.filter(e => e.tags?.amenity === "police").length;

  const poiCount    = nearby.filter(e =>
    ["restaurant","cafe","marketplace","food_court","bar","pub","fast_food",
     "college","university","school","supermarket","mall"]
      .includes(e.tags?.amenity || e.tags?.shop)
  ).length;

  const safeCount   = nearby.filter(e =>
    e.tags?.tourism === "hotel"    ||
    e.tags?.amenity === "hospital" ||
    e.tags?.amenity === "clinic"   ||
    e.tags?.amenity === "pharmacy"
  ).length;

  const nearbyCrimes = crimeIncidents.filter(c => {
    if (!c.lat || !c.lon) return false;
    return getDistance(lat, lon, c.lat, c.lon) < 500;
  });

  // ── Proxy: estimate lighting from road context ──
  // If many POIs nearby → likely main road → better lighting
  const roadLightingProxy = poiCount > 3 ? 0.6 : poiCount > 1 ? 0.4 : 0.2;

  // ── Normalize raw OSM values 0→1 ──
  const L_osm = lampCount   > 0 ? Math.min(lampCount / 5, 1)   : 0;
  const P_osm = policeCount > 0 ? Math.min(policeCount / 2, 1) : 0;
  const C_osm = poiCount    > 0 ? Math.min(poiCount / 8, 1)    : 0;
  const S_osm = safeCount   > 0 ? Math.min(safeCount / 4, 1)   : 0;

  const crimeRisk = Math.min(nearbyCrimes.length / 3, 1);

  // ── Time-based scores combining OSM + proxy ──
  let L, C, P, S, riskMultiplier;
  let w_light, w_crowd, w_police, w_risk, w_safe;

  if (timeZone === "night") {
    // 11PM–6AM: lighting critical, crowd minimal, risk amplified
    L = L_osm > 0 ? L_osm : roadLightingProxy * 0.3; // dark unless proven lit
    C = C_osm > 0 ? C_osm * 0.2 : 0.05;              // most places closed
    P = P_osm > 0 ? P_osm : 0.15;
    S = S_osm > 0 ? S_osm : 0.15;
    riskMultiplier = 1.5;                              // risk zones × 1.5 at night

    w_light  = 0.40;
    w_crowd  = 0.10;
    w_police = 0.15;
    w_risk   = 0.30;
    w_safe   = 0.05;

  } else if (timeZone === "evening") {
    // 5PM–11PM: street lights on, peak crowd, balanced risk
    L = L_osm > 0 ? L_osm : roadLightingProxy * 0.7; // street lights likely on
    C = C_osm > 0 ? C_osm * 1.3 : 0.65;              // peak activity
    P = P_osm > 0 ? P_osm : 0.25;
    S = S_osm > 0 ? S_osm : 0.35;
    riskMultiplier = 1.2;

    w_light  = 0.25;
    w_crowd  = 0.25;
    w_police = 0.15;
    w_risk   = 0.25;
    w_safe   = 0.10;

  } else {
    // 6AM–5PM: sunlight, normal crowd, lower risk
    L = 1.0;                                           // sunlight = always lit
    C = C_osm > 0 ? C_osm * 1.0 : 0.60;              // normal daytime activity
    P = P_osm > 0 ? P_osm : 0.40;
    S = S_osm > 0 ? S_osm : 0.40;
    riskMultiplier = 1.0;

    w_light  = 0.10;                                   // lighting not critical
    w_crowd  = 0.40;                                   // crowd = safety during day
    w_police = 0.20;
    w_risk   = 0.20;
    w_safe   = 0.10;
  }

  // Clamp all factors
  L = Math.min(L, 1); C = Math.min(C, 1);
  P = Math.min(P, 1); S = Math.min(S, 1);

  const adjustedCrimeRisk = Math.min(crimeRisk * riskMultiplier, 1);

  const risk =
    w_light  * (1 - L) +
    w_crowd  * (1 - C) +
    w_police * (1 - P) +
    w_risk   * adjustedCrimeRisk +
    w_safe   * (1 - S);

  return Math.max(0, Math.min(1, risk));
};