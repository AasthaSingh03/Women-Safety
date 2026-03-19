export const analyzeRoute = async (startCoords, destCoords) => {

  const res = await fetch("http://localhost:3000/api/route/analyze", {

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