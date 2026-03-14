"use client";

import { useState, useEffect, useRef } from "react";
import {
  geocodePlace,
  reverseGeocode,
  getPlaceSuggestions
} from "../services/api";

export default function SearchPanel({
  destination,
  setDestination,
  setRoutes,
  currentLocation
}) {

  const [startPlace, setStartPlace] = useState("");
  const [destPlace, setDestPlace] = useState("");

  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);

  const startDebounceRef = useRef(null);
  const destDebounceRef = useRef(null);

  // Auto detect current location
  useEffect(() => {

    const loadLocation = async () => {

      if (!currentLocation || currentLocation.length !== 2) return;

      const [lat, lng] = currentLocation;

      try {

        const placeName = await reverseGeocode(lat, lng);

        setStartPlace(placeName);

      } catch {

        setStartPlace("");

      }

    };

    loadLocation();

  }, [currentLocation]);


  // 🔎 Debounced start search
  const handleStartChange = (value) => {

    setStartPlace(value);

    if (startDebounceRef.current) {
      clearTimeout(startDebounceRef.current);
    }

    startDebounceRef.current = setTimeout(async () => {

      if (value.length < 2) {
        setStartSuggestions([]);
        return;
      }

      try {

        const suggestions = await getPlaceSuggestions(value);

        setStartSuggestions(suggestions);

      } catch {

        setStartSuggestions([]);

      }

    }, 300);

  };


  // 🔎 Debounced destination search
  const handleDestChange = (value) => {

    setDestPlace(value);

    if (destDebounceRef.current) {
      clearTimeout(destDebounceRef.current);
    }

    destDebounceRef.current = setTimeout(async () => {

      if (value.length < 2) {
        setDestSuggestions([]);
        return;
      }

      try {

        const suggestions = await getPlaceSuggestions(value);

        setDestSuggestions(suggestions);

      } catch {

        setDestSuggestions([]);

      }

    }, 300);

  };


  const handleFindRoute = async () => {

    if (!startPlace || !destPlace) {
      alert("Enter both start and destination");
      return;
    }

    try {

      const startCoords = await geocodePlace(startPlace);
      const destCoords = await geocodePlace(destPlace);

      const res = await fetch("http://localhost:5000/api/route/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          start: startCoords,
          destination: destCoords,
        }),
      });

      const data = await res.json();

      if (data.success) {

        setRoutes(data.routes);

      } else {

        alert("Route analysis failed");

      }

    } catch (error) {

      console.error(error);
      alert("Location not found");

    }

  };


return (
  <div className="fixed top-16 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white rounded-xl shadow-lg p-4 z-[200]">

    {/* START INPUT */}
    <div className="relative mb-4">

      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white">
        <span className="text-pink-500">📍</span>

        <input
          type="text"
          placeholder="Enter start place"
          value={startPlace}
          onChange={(e) => handleStartChange(e.target.value)}
          className="w-full outline-none text-sm"
        />

        {startPlace && (
          <button
            onClick={() => {
              setStartPlace("");
              setStartSuggestions([]);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* START SUGGESTIONS */}
      {startSuggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-md mt-1 max-h-48 overflow-y-auto z-50">

          {startSuggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => {
                setStartPlace(s);
                setStartSuggestions([]);
              }}
              className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {s}
            </div>
          ))}

        </div>
      )}

    </div>


    {/* DESTINATION INPUT */}
    <div className="relative mb-4">

      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white">
        <span className="text-pink-500">📍</span>

        <input
          type="text"
          placeholder="Enter destination place"
          value={destPlace}
          onChange={(e) => handleDestChange(e.target.value)}
          className="w-full outline-none text-sm"
        />

        {destPlace && (
          <button
            onClick={() => {
              setDestPlace("");
              setDestSuggestions([]);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* DESTINATION SUGGESTIONS */}
      {destSuggestions.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-md mt-1 max-h-48 overflow-y-auto z-50">

          {destSuggestions.map((s, i) => (
            <div
              key={i}
              onClick={() => {
                setDestPlace(s);
                setDestSuggestions([]);
              }}
              className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {s}
            </div>
          ))}

        </div>
      )}

    </div>


    {/* SEARCH BUTTON */}
    <button
      onClick={handleFindRoute}
      className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
    >
      Find Safest Route
    </button>

  </div>
);
}