import axios from "axios";
import Infrastructure from "../models/Infrastructure.js";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// Fetch infrastructure for any bbox dynamically
export async function fetchAndSaveInfrastructure(bbox) {

  const [minLat, minLon, maxLat, maxLon] = bbox;
  const bboxStr = `${minLat},${minLon},${maxLat},${maxLon}`;

  console.log(`Fetching infrastructure for bbox: ${bboxStr}`);

  const query = `
  [out:json][timeout:60];
  (
    node["amenity"="police"](${bboxStr});
    node["highway"="street_lamp"](${bboxStr});
    node["lit"="yes"](${bboxStr});
    way["lit"="yes"](${bboxStr});
    node["tourism"="hotel"](${bboxStr});
    node["tourism"="hostel"](${bboxStr});
    node["amenity"="hospital"](${bboxStr});
    node["amenity"="clinic"](${bboxStr});
    node["amenity"="pharmacy"](${bboxStr});
    node["amenity"="restaurant"](${bboxStr});
    node["amenity"="cafe"](${bboxStr});
    node["amenity"="fast_food"](${bboxStr});
    node["amenity"="marketplace"](${bboxStr});
    node["amenity"="bank"](${bboxStr});
    node["amenity"="atm"](${bboxStr});
    node["shop"="mall"](${bboxStr});
  );
  out body;
  `;

  const res = await axios.get(OVERPASS_URL, {
    params: { data: query },
    timeout: 65000
  });

  const elements = res.data.elements;
  console.log(`Fetched ${elements.length} elements from OSM`);

  const docs = elements
    .filter(e => e.lat && e.lon)
    .map(e => ({
      type: e.tags?.amenity || e.tags?.tourism || e.tags?.highway || e.tags?.shop,
      lat: e.lat,
      lon: e.lon,
      tags: e.tags,
      bbox: bboxStr  // ← track which bbox this data belongs to
    }));

  return docs;
}


// One-time seeding for a specific city (run manually)
export async function importInfrastructure(bbox) {

  // Default to wider India-friendly bbox if none provided
  const targetBbox = bbox || [20.15, 85.72, 20.45, 85.95];

  console.log("Starting infrastructure import...");

  try {

    const docs = await fetchAndSaveInfrastructure(targetBbox);

    await Infrastructure.deleteMany({});
    await Infrastructure.insertMany(docs);

    console.log(`✅ Saved ${docs.length} infrastructure records`);

    const types = {};
    docs.forEach(d => { types[d.type] = (types[d.type] || 0) + 1; });
    console.log("Breakdown:", types);

  } catch (err) {
    console.error("Infrastructure import failed:", err.message);
    throw err;
  }
}


// Dynamic fetch for any route bbox — no DB delete, upsert only new area
export async function fetchInfrastructureForArea(bbox) {

  const [minLat, minLon, maxLat, maxLon] = bbox;

  // Check if we already have data for this area in DB
  const existing = await Infrastructure.countDocuments({
    lat: { $gte: minLat, $lte: maxLat },
    lon: { $gte: minLon, $lte: maxLon }
  });

  // If enough data exists, use DB cache
  if (existing > 100) {
    console.log(`Using cached infrastructure: ${existing} records`);
    return await Infrastructure.find({
      lat: { $gte: minLat, $lte: maxLat },
      lon: { $gte: minLon, $lte: maxLon }
    });
  }

  // Otherwise fetch live from Overpass and cache it
  console.log("No cached data — fetching live from Overpass...");

  try {

    const docs = await fetchAndSaveInfrastructure(bbox);

    if (docs.length > 0) {
      await Infrastructure.insertMany(docs, { ordered: false }).catch(() => {});
      console.log(`Cached ${docs.length} new infrastructure records`);
    }

    return docs;

  } catch (err) {
    console.warn("Overpass fetch failed, using empty infra:", err.message);
    return [];
  }
}