const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const BBSR_LNG = 85.8245;
const BBSR_LAT = 20.2961;
const BBSR_BBOX = "85.75,20.17,85.92,20.38";

// 🔎 Autocomplete suggestions — biased to Bhubaneswar
export async function getPlaceSuggestions(query) {

  if (!query || query.length < 2) return [];

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${MAPBOX_TOKEN}` +
    `&autocomplete=true` +
    `&limit=6` +
    `&country=in` +
    `&proximity=${BBSR_LNG},${BBSR_LAT}` +
    `&bbox=${BBSR_BBOX}` +
    `&types=poi,place,locality,neighborhood,address`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.features) return [];

  return data.features.map(place => {

    const name = place.text || "";
    const context = place.context || [];

    const locality = context.find(c =>
      c.id.startsWith("locality") || c.id.startsWith("neighborhood")
    )?.text || "";

    const city = context.find(c =>
      c.id.startsWith("place")
    )?.text || "Bhubaneswar";

    const state = context.find(c =>
      c.id.startsWith("region")
    )?.text || "Odisha";

    const parts = [name, locality, city, state].filter(Boolean);
    const builtName = [...new Set(parts)].join(", ");

    // ← KEY FIX: if built name is too vague (just "Campus, Patia...")
    // fall back to Mapbox's own full place_name which has the complete name
    const isVague = !name || name.length < 5 || name.toLowerCase() === query.toLowerCase().trim();

    return isVague ? place.place_name : builtName;

  });

}


// Convert place → coordinates — biased to Bhubaneswar
export async function geocodePlace(place) {

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json` +
    `?access_token=${MAPBOX_TOKEN}` +
    `&limit=1` +
    `&country=in` +
    `&proximity=${BBSR_LNG},${BBSR_LAT}` +
    `&bbox=${BBSR_BBOX}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.features || data.features.length === 0) {
    throw new Error("Place not found");
  }

  const coords = data.features[0].geometry.coordinates;

  return [
    coords[1], // lat
    coords[0]  // lng
  ];

}


// Reverse geocode (coordinates → place name)
export async function reverseGeocode(lat, lng) {

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?access_token=${MAPBOX_TOKEN}` +
    `&limit=1` +
    `&country=in` +
    `&types=poi,address,locality,neighborhood`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.features || data.features.length === 0) {
    return "Current Location";
  }

  const place = data.features[0];
  const context = place.context || [];

  const name = place.text || "";
  const locality = context.find(c =>
    c.id.startsWith("locality") || c.id.startsWith("neighborhood")
  )?.text || "";
  const city = context.find(c =>
    c.id.startsWith("place")
  )?.text || "Bhubaneswar";

  const parts = [name, locality, city].filter(Boolean);
  return [...new Set(parts)].join(", ");

}