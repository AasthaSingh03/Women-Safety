import axios from "axios";

export async function getRoadRoutes(start, destination) {
  try {

    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [
          [start[1], start[0]],
          [destination[1], destination[0]]
        ],
        alternative_routes: {
          target_count: 3,
          weight_factor: 1.6
        }
      },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    const data = response.data;

    if (!data.features || data.features.length === 0) {
      throw new Error("No routes returned");
    }

    const routes = data.features.map((feature) => {

      const geometry = feature.geometry.coordinates;

      const coords = geometry.map(
        ([lng, lat]) => [lat, lng]
      );

      const summary = feature.properties?.summary || {};

      return {
        coords,
        distance: summary.distance || 0,
        duration: summary.duration || 0
      };

    });

    return routes;

  } catch (error) {

    console.error(
      "ORS API ERROR:",
      error.response?.data || error.message
    );

    throw new Error("ORS route fetch failed");
  }
}