import axios from "axios";

export async function geocodeLocation(place) {

  try {

    const response = await axios.get(
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
      encodeURIComponent(place) +
      ".json",
      {
        params: {
          access_token: process.env.MAPBOX_API_KEY
        }
      }
    );

    if (!response.data.features.length) return null;

    const coords = response.data.features[0].center;

    return {
      lon: coords[0],
      lat: coords[1]
    };

  } catch (error) {

    console.error("Geocode error:", error.message);
    return null;

  }

}