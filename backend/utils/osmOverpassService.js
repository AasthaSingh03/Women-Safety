import axios from "axios";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function fetchPOIData(bbox) {

  const [minLat, minLng, maxLat, maxLng] = bbox;

  const query = `
  [out:json];
  (
    node["amenity"="police"](${minLat},${minLng},${maxLat},${maxLng});
    node["tourism"="hotel"](${minLat},${minLng},${maxLat},${maxLng});
  );
  out;
  `;

  try {

    const response = await axios.post(
      OVERPASS_URL,
      query,
      { headers: { "Content-Type": "text/plain" } }
    );

    return response.data.elements;

  } catch (error) {

    console.error("Overpass API error:", error.message);
    return [];

  }

}