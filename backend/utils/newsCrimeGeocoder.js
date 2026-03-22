import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const geocodeCache = new Map();

export async function geocodeLocation(place) {

  if (!place || place.length < 2) return null;
  if (geocodeCache.has(place)) return geocodeCache.get(place);

  try {

    const res = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_API_KEY,
          country: "in",
          limit: 1,
          types: "place,locality,neighborhood,district,region"
        }
      }
    );

    if (!res.data.features?.length) {
      geocodeCache.set(place, null);
      return null;
    }

    const coords = res.data.features[0].center;
    const result = { lon: coords[0], lat: coords[1] };
    geocodeCache.set(place, result);
    return result;

  } catch (err) {
    console.error("Geocode error:", place, err.message);
    return null;
  }
}