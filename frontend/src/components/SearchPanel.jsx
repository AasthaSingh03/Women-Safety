"use client";

import { useState, useEffect, useRef } from "react";
import { geocodePlace, reverseGeocode, getPlaceSuggestions } from "../services/api";

const getAutoZone = () => {
  const h = new Date().getHours();
  if (h >= 23 || h < 6) return "night";
  if (h >= 17) return "evening";
  return "day";
};

export default function SearchPanel({
  destination, setDestination, setRoutes,
  currentLocation, lastSearchRef,
}) {

  const [startPlace, setStartPlace] = useState("");
  const [destPlace, setDestPlace] = useState("");
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [destProximity, setDestProximity] = useState(null);
  const startDebounceRef = useRef(null);
  const destDebounceRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      if (!currentLocation?.length) return;
      const [lat, lng] = currentLocation;
      try { setStartPlace(await reverseGeocode(lat, lng)); }
      catch { setStartPlace(""); }
    };
    load();
  }, [currentLocation]);

  const handleStartChange = (value) => {
    setStartPlace(value);
    if (startDebounceRef.current) clearTimeout(startDebounceRef.current);
    startDebounceRef.current = setTimeout(async () => {
      if (value.length < 2) { setStartSuggestions([]); return; }
      try {
        const [lat, lng] = currentLocation || [];
        setStartSuggestions(await getPlaceSuggestions(value, lat, lng, true));
      } catch { setStartSuggestions([]); }
    }, 300);
  };

  const handleDestChange = (value) => {
    setDestPlace(value);
    if (destDebounceRef.current) clearTimeout(destDebounceRef.current);
    destDebounceRef.current = setTimeout(async () => {
      if (value.length < 2) { setDestSuggestions([]); return; }
      try {
        const [lat, lng] = destProximity || [];
        setDestSuggestions(await getPlaceSuggestions(value, lat, lng, false));
      } catch { setDestSuggestions([]); }
    }, 300);
  };

  const handleFindRoute = async () => {
    if (!startPlace || !destPlace) { alert("Enter both start and destination"); return; }
    try {
      const [lat, lng] = currentLocation || [];
      const startCoords = await geocodePlace(startPlace, lat, lng);
      const destCoords  = await geocodePlace(destPlace, lat, lng);

      // Save for timezone toggle re-fetch
      if (lastSearchRef) {
        lastSearchRef.current = { startCoords, destCoords };
      }

      const timeZone = getAutoZone(); // auto-detect on initial search

      const res = await fetch("http://localhost:5000/api/route/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: startCoords, destination: destCoords, timeZone }),
      });
      const data = await res.json();
      if (data.success) setRoutes(data.routes);
      else alert("Route analysis failed");
    } catch (err) {
      console.error(err);
      alert("Location not found");
    }
  };

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white rounded-b-xl shadow-lg p-4 z-[200]">

      <div className="relative mb-3">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white">
          <span className="text-pink-500">📍</span>
          <input type="text" placeholder="Enter start place" value={startPlace}
            onChange={(e) => handleStartChange(e.target.value)}
            className="w-full outline-none text-sm" />
          {startPlace && (
            <button onClick={() => { setStartPlace(""); setStartSuggestions([]); }}
              className="text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
        {startSuggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-md mt-1 max-h-48 overflow-y-auto z-50">
            {startSuggestions.map((s, i) => (
              <div key={i} onClick={() => { setStartPlace(s); setStartSuggestions([]); }}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">{s}</div>
            ))}
          </div>
        )}
      </div>

      <div className="relative mb-3">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white">
          <span className="text-red-500">🎯</span>
          <input type="text" placeholder="Enter destination place" value={destPlace}
            onChange={(e) => handleDestChange(e.target.value)}
            className="w-full outline-none text-sm" />
          {destPlace && (
            <button onClick={() => { setDestPlace(""); setDestSuggestions([]); setDestProximity(null); }}
              className="text-gray-400 hover:text-gray-600">✕</button>
          )}
        </div>
        {destSuggestions.length > 0 && (
          <div className="absolute top-full left-0 w-full bg-white border rounded-lg shadow-md mt-1 max-h-48 overflow-y-auto z-50">
            {destSuggestions.map((s, i) => (
              <div key={i}
                onClick={async () => {
                  setDestPlace(s); setDestSuggestions([]);
                  try { setDestProximity(await geocodePlace(s)); } catch {}
                }}
                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer">{s}</div>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleFindRoute}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
        Find Safest Route
      </button>
    </div>
  );
}