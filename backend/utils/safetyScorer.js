const getDistance = (lat1, lon1, lat2, lon2) => {

  const R = 6371e3;

  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;

  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

};


export const calculatePointRisk = (
  allInfra,
  crimeIncidents,
  lat,
  lon
) => {

  const radius = 300;

  const nearby = allInfra.filter(item => {

    const itemLat = item.lat;
    const itemLon = item.lon;

    if (!itemLat) return false;

    return getDistance(lat, lon, itemLat, itemLon) < radius;

  });

  const lights = nearby.filter(e =>
    e.tags?.highway === "street_lamp" ||
    e.tags?.lit === "yes"
  ).length;

  const police = nearby.filter(e =>
    e.tags?.amenity === "police"
  ).length;

  const crowd = nearby.filter(e =>
    ["restaurant", "cafe", "marketplace"]
      .includes(e.tags?.amenity)
  ).length;

  const safePlaces = nearby.filter(e =>
    e.tags?.tourism === "hotel" ||
    e.tags?.amenity === "hospital"
  ).length;

  const nearbyCrimes = crimeIncidents.filter(c => {

    const dist = getDistance(
      lat,
      lon,
      c.lat,
      c.lon
    );

    return dist < 500;

  });

  const crimeRisk = Math.min(nearbyCrimes.length / 3, 1);

  const L = Math.min(lights / 6, 1);
  const P = Math.min(police / 2, 1);
  const C = Math.min(crowd / 6, 1);
  const S = Math.min(safePlaces / 4, 1);

  const risk =
      0.35 * crimeRisk +
      0.25 * (1 - L) +
      0.20 * (1 - C) +
      0.10 * (1 - P) -
      0.10 * S;

  return Math.max(0, Math.min(1, risk));

};