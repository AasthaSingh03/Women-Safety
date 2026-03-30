export const analyzeRoute = async (startCoords, destCoords) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const res = await fetch(`${BASE_URL}/api/route/analyze`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      start: startCoords,
      destination: destCoords
    })

  });

  const data = await res.json();

  return data;

};