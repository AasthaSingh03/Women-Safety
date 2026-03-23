"use client";
import { useState, useEffect, useRef } from "react";

export default function LocationInput({ onRouteSearch }) {
  const [start, setStart] = useState("");
  const [destination, setDestination] = useState("");
  const userEditedStart = useRef(false); // ← KEY FIX: track if user manually typed start

  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        // ← Only set start from GPS if user hasn't manually edited it
        if (!userEditedStart.current) {
          setStart(`${lat},${lng}`);
        }
      },
      (error) => {
        console.log("Geolocation error:", error);
        alert("Please allow location access in browser");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const handleStartChange = (value) => {
    userEditedStart.current = true; // ← Mark as user-edited so GPS won't overwrite
    setStart(value);
  };

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
        onChange={(e) => handleStartChange(e.target.value)}
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