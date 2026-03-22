const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// biasToUser=true → near current location, false → all India equally
export async function getPlaceSuggestions(query, userLat, userLng, biasToUser = true) {

  if (!query || query.length < 2) return [];

  const lat = biasToUser ? (userLat || 20.5937) : 20.5937;
  const lng = biasToUser ? (userLng || 78.9629) : 78.9629;

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json` +
    `?access_token=${MAPBOX_TOKEN}` +
    `&autocomplete=true` +
    `&limit=6` +
    `&country=in` +
    `&proximity=${lng},${lat}` +
    `&types=poi,place,locality,neighborhood,address,region,district`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data.features) return [];

  return data.features.map(place => {
    const name = place.text || "";
    const context = place.context || [];
    const locality = context.find(c =>
      c.id.startsWith("locality") || c.id.startsWith("neighborhood")
    )?.text || "";
    const city = context.find(c => c.id.startsWith("place"))?.text || "";
    const state = context.find(c => c.id.startsWith("region"))?.text || "";
    const parts = [name, locality, city, state].filter(Boolean);
    const builtName = [...new Set(parts)].join(", ");
    return (!name || name.length < 4) ? place.place_name : builtName;
  });
}


export async function geocodePlace(place, userLat, userLng) {

  const lat = userLat || 20.5937;
  const lng = userLng || 78.9629;

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json` +
    `?access_token=${MAPBOX_TOKEN}` +
    `&limit=1` +
    `&country=in` +
    `&proximity=${lng},${lat}` +
    `&types=poi,place,locality,neighborhood,address,region,district`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.features || data.features.length === 0)
    throw new Error("Place not found");

  const coords = data.features[0].geometry.coordinates;
  return [coords[1], coords[0]];
}


export async function reverseGeocode(lat, lng) {

  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json` +
    `?access_token=${MAPBOX_TOKEN}` +
    `&limit=1` +
    `&country=in` +
    `&types=poi,address,locality,neighborhood`;

  const res = await fetch(url);
  const data = await res.json();
  if (!data.features || data.features.length === 0) return "Current Location";

  const place = data.features[0];
  const context = place.context || [];
  const name = place.text || "";
  const locality = context.find(c =>
    c.id.startsWith("locality") || c.id.startsWith("neighborhood")
  )?.text || "";
  const city = context.find(c => c.id.startsWith("place"))?.text || "";
  const parts = [name, locality, city].filter(Boolean);
  return [...new Set(parts)].join(", ");
}