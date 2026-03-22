import axios from "axios";

export async function getRoadRoutes(start, destination) {
  try {

    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [
          [start[1], start[0]],       // ORS needs [lng, lat]
          [destination[1], destination[0]]
        ],
        alternative_routes: {
          target_count: 3,
          weight_factor: 1.6,
          share_factor: 0.6            // ← forces more distinct alternatives
        },
        instructions: false,
        preference: "recommended"
      },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    const data = response.data;

    if (!data.features || data.features.length === 0) {
      throw new Error("No routes returned from ORS");
    }

    console.log(`ORS returned ${data.features.length} routes`);

    const routes = data.features.map((feature) => {

      const geometry = feature.geometry.coordinates;

      // ORS returns [lng, lat] → flip to [lat, lng] for Leaflet
      const coords = geometry.map(([lng, lat]) => [lat, lng]);

      const summary = feature.properties?.summary || {};

      return {
        coords,
        distance: summary.distance || 0,
        duration: summary.duration || 0
      };

    });

    return routes;

  } catch (error) {

    console.error("ORS API ERROR:", error.response?.data || error.message);

    // Log full error for debugging
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
    }

    throw new Error("ORS route fetch failed");
  }
}