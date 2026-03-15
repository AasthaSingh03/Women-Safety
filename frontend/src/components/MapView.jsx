"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline
} from "react-leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function MapView({
  setCurrentLocation,
  selectedRoute = [],
  segments = []
}) {

  const [position, setPosition] = useState(null);

  const getZoneColor = (risk) => {
    if (risk === "high") return "red";
    if (risk === "moderate") return "orange";
    return "green";
  };

  // Get user location
  useEffect(() => {

    navigator.geolocation.getCurrentPosition(
      (pos) => {

        const location = [
          pos.coords.latitude,
          pos.coords.longitude
        ];

        setPosition(location);
        setCurrentLocation(location);

      },
      (err) => console.error("Location error:", err)
    );

  }, [setCurrentLocation]);


  if (!position) {

    return (
      <div className="flex items-center justify-center h-full">
        Loading Map...
      </div>
    );

  }

  return (

    <MapContainer
      center={position}
      zoom={15}
      style={{ width: "100%", height: "100%" }}
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {/* USER LOCATION */}
      <Marker position={position} />

      {/* DEFAULT ROUTE */}
      {selectedRoute.length > 1 && segments.length === 0 && (

        <Polyline
          positions={selectedRoute}
          pathOptions={{
            color: "blue",
            weight: 5
          }}
        />

      )}

      {/* SEGMENT BASED ROUTE */}
      {segments.map((seg, i) => {

        let color = "green";

        if (seg.risk > 0.7) {
          color = "red";
        } else if (seg.risk > 0.4) {
          color = "yellow";
        }

        return (

          <Polyline
            key={i}
            positions={seg.coords}
            pathOptions={{
              color,
              weight: 6
            }}
          />

        );

      })}



    </MapContainer>

  );

}