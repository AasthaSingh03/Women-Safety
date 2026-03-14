import axios from "axios";
import Infrastructure from "../models/Infrastructure.js";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function importInfrastructure() {

  console.log("Importing city infrastructure...");

  const bbox = [
    20.22, 85.75,
    20.40, 85.90
  ]; // Bhubaneswar area

  const query = `
  [out:json][timeout:25];
  (
    node["amenity"="police"](${bbox.join(",")});
    node["highway"="street_lamp"](${bbox.join(",")});
    node["tourism"="hotel"](${bbox.join(",")});
    node["amenity"="hospital"](${bbox.join(",")});
    node["amenity"~"restaurant|cafe|marketplace"](${bbox.join(",")});
  );
  out body;
  `;

  const res = await axios.get(OVERPASS_URL, {
    params: { data: query }
  });

  const elements = res.data.elements;

  console.log("Infrastructure fetched:", elements.length);

  await Infrastructure.deleteMany({});

const docs = elements
  .filter(e => e.lat && e.lon)
  .map(e => ({
    type: e.tags?.amenity || e.tags?.tourism || e.tags?.highway,
    lat: e.lat,
    lon: e.lon,
    tags: e.tags
  }));

await Infrastructure.insertMany(docs);

  

  console.log("Infrastructure saved to DB");

}