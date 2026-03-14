const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;


// 🔎 Autocomplete suggestions
export async function getPlaceSuggestions(query) {

  if (!query || query.length < 2) return [];

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${MAPBOX_TOKEN}` +
    `&autocomplete=true` +
    `&limit=6` +
    `&country=in`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.features) return [];

  return data.features.map(place => place.place_name);

}



// Convert place → coordinates
export async function geocodePlace(place) {

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json` +
    `?access_token=${MAPBOX_TOKEN}` +
    `&limit=1` +
    `&country=in`;

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



// Reverse geocode (coordinates → place)
export async function reverseGeocode(lat, lng) {

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?access_token=${MAPBOX_TOKEN}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.features || data.features.length === 0) {
    return "Current Location";
  }

  return data.features[0].place_name;

}