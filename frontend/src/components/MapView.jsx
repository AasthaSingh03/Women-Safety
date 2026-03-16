"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet-rotatedmarker";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";

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

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const lastPosition = useRef(null);

  /* -----------------------
     heading calculation
  ----------------------- */

  const getHeading = (lat1, lon1, lat2, lon2) => {

    const dLon = (lon2 - lon1) * Math.PI / 180;

    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);

    const x =
      Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
      Math.sin(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.cos(dLon);

    const brng = Math.atan2(y, x);

    return (brng * 180 / Math.PI + 360) % 360;

  };

  /* -----------------------
     GPS tracking
  ----------------------- */

  useEffect(() => {

    const watch = navigator.geolocation.watchPosition(

      (pos) => {

        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        const newPos = [lat, lon];

        setPosition(newPos);
        setCurrentLocation(newPos);

        /* camera follow */

        if (mapRef.current) {

          mapRef.current.flyTo(newPos, 17, {
            duration: 1
          });

        }

        /* rotate marker */

        if (markerRef.current && lastPosition.current) {

          const heading = getHeading(
            lastPosition.current[0],
            lastPosition.current[1],
            lat,
            lon
          );

          markerRef.current.setRotationAngle(heading);

        }

        lastPosition.current = newPos;

      },

      (err) => console.log("GPS error", err),

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }

    );

    return () => navigator.geolocation.clearWatch(watch);

  }, [setCurrentLocation]);

  if (!position) {

    return (
      <div className="flex items-center justify-center h-full">
        Loading Map...
      </div>
    );

  }

  /* destination = last coordinate */

  const destination =
    selectedRoute.length > 0
      ? selectedRoute[selectedRoute.length - 1]
      : null;

  return (

    <MapContainer
      center={position}
      zoom={17}
      whenCreated={(map) => (mapRef.current = map)}
      style={{ width: "100%", height: "100%" }}
    >

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />

      {/* USER MARKER */}

      <Marker
        position={position}
        ref={markerRef}
        rotationAngle={0}
        rotationOrigin="center"
      />

      {/* DESTINATION MARKER */}

      {destination && (

        <Marker position={destination} />

      )}

      {/* MAIN ROUTE */}

      {selectedRoute.length > 1 && (

        <Polyline
          positions={selectedRoute}
          pathOptions={{ color: "blue", weight: 6 }}
        />

      )}

      {/* SAFETY SEGMENTS */}

      {segments.map((seg, i) => {

        let color = "green";

        if (seg.risk > 0.7) color = "red";
        else if (seg.risk > 0.4) color = "orange";

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