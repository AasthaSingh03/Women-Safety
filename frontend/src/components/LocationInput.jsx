// "use client";
// import { useState, useEffect } from "react";

// export default function LocationInput({ onRouteSearch }) {

//   const [start, setStart] = useState("");
//   const [destination, setDestination] = useState("");

//   useEffect(() => {

//     if (!navigator.geolocation) {
//       alert("Geolocation not supported");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(

//       (position) => {

//         const lat = position.coords.latitude;
//         const lng = position.coords.longitude;

//         console.log("Detected location:", lat, lng);

//         setStart(`${lat},${lng}`);

//       },

//       (error) => {

//         console.log("Geolocation error:", error);

//         alert("Please allow location access in browser");

//       },

//       {
//         enableHighAccuracy: true
//       }

//     );

//   }, []);

//   const handleSearch = () => {

//     if (!start || !destination) {
//       alert("Enter destination");
//       return;
//     }

//     const startCoords = start.split(",").map(Number);
//     const destCoords = destination.split(",").map(Number);

//     onRouteSearch(startCoords, destCoords);

//   };

//   return (

//     <div className="bg-white shadow-lg rounded-xl p-4 w-full max-w-md">

//       <input
//         type="text"
//         placeholder="Your Location (auto detected)"
//         value={start}
//         onChange={(e) => setStart(e.target.value)}
//         className="w-full border p-2 rounded mb-3"
//       />

//       <input
//         type="text"
//         placeholder="Enter destination as lat,lng"
//         value={destination}
//         onChange={(e) => setDestination(e.target.value)}
//         className="w-full border p-2 rounded mb-3"
//       />

//       <button
//         onClick={handleSearch}
//         className="w-full bg-blue-600 text-white p-2 rounded"
//       >
//         Find Safest Route
//       </button>

//     </div>

//   );

// }

"use client";
import { useState, useEffect } from "react";

export default function LocationInput({ onRouteSearch }) {

  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");

  useEffect(() => {

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log("Detected location:", lat, lng);

        setStart(`${lat},${lng}`);

      },

      (error) => {

        console.log("Geolocation error:", error);

        alert("Please allow location access in browser");

      },

      {
        enableHighAccuracy: true
      }

    );

  }, []);

  const handleSearch = () => {

    if (!start || !destination) {
      alert("Enter destination");
      return;
    }

    const startCoords = start.split(",").map(Number);
    const destCoords = destination.split(",").map(Number);

    onRouteSearch(startCoords, destCoords);

  };

  return (

    <div className="bg-white shadow-lg rounded-xl p-4 w-full max-w-md">

      <input
        type="text"
        placeholder="Your Location (auto detected)"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />

      <input
        type="text"
        placeholder="Enter destination as lat,lng"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        className="w-full border p-2 rounded mb-3"
      />

      <button
        onClick={handleSearch}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        Find Safest Route
      </button>

    </div>

  );

}