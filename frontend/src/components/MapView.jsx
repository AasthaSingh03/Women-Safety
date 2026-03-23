"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapController({ position, selectedRoute, navigationMode, autoFollow, setAutoFollow, mapRef }) {
  const map = useMap();
  const prevNavigationMode = useRef(false);
  const followTimerRef = useRef(null);

  useEffect(() => {
    if (map) mapRef.current = map;
  }, [map, mapRef]);

  useEffect(() => {
    if (!map) return;
    map.dragging.enable();
    map.touchZoom.enable();
    map.scrollWheelZoom.enable();
    map.doubleClickZoom.enable();
    map.boxZoom.enable();
    if (map.tap) map.tap.enable();
    const container = map.getContainer();
    container.style.touchAction = "auto";
    container.style.userSelect = "none";
    container.style.webkitUserSelect = "none";
    const onDragStart = () => setAutoFollow(false);
    map.on("dragstart", onDragStart);
    return () => {
      map.off("dragstart", onDragStart);
      if (followTimerRef.current) clearTimeout(followTimerRef.current);
    };
  }, [map, setAutoFollow]);

  useEffect(() => {
    if (!map) return;
    const justStartedNav = navigationMode && !prevNavigationMode.current;
    prevNavigationMode.current = navigationMode;

    if (justStartedNav && selectedRoute.length > 1) {
      setAutoFollow(false);
      const bounds = L.latLngBounds(selectedRoute);
      map.fitBounds(bounds, { padding: [60, 60], animate: true });
      if (followTimerRef.current) clearTimeout(followTimerRef.current);
      return;
    }

    if (!navigationMode && selectedRoute.length > 1) {
      const bounds = L.latLngBounds(selectedRoute);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [selectedRoute, navigationMode, map, setAutoFollow]);

  useEffect(() => {
    if (!map || !position) return;
    if (navigationMode && autoFollow) {
      map.flyTo(position, 17, { duration: 1, animate: true });
    }
  }, [position, navigationMode, autoFollow, map]);

  return null;
}

function RotatingMarker({ position, rotationAngle, navigationMode }) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position) return;

    const html = navigationMode
      ? `<div style="
            position: relative;
            width: 24px; height: 26px;
            display: flex; align-items: center; justify-content: center;
          ">
            <div style="
              width: 0; height: 0;
              border-left: 10px solid transparent;
              border-right: 10px solid transparent;
              border-bottom: 26px solid #2563eb;
              filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
              transform: rotate(${rotationAngle}deg);
              transform-origin: center 18px;
              transition: transform 0.3s ease;
            "></div>
            <div style="
              position: absolute;
              width: 8px; height: 8px;
              background: white; border-radius: 50%;
              top: 12px;
            "></div>
          </div>`
      : `<div style="
            width: 22px; height: 22px;
            background: #2563eb;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          "></div>`;

    const icon = L.divIcon({
      className: "",
      html,
      iconSize: [24, 26],
      iconAnchor: [12, 13],
    });

    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon, zIndexOffset: 1000 }).addTo(map);
    } else {
      markerRef.current.setLatLng(position);
      markerRef.current.setIcon(icon);
    }

    return () => {
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
    };
  }, [map, position, rotationAngle, navigationMode]);

  return null;
}

function RedMarker({ position }) {
  const map = useMap();
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position) return;
    const icon = L.divIcon({
      className: "",
      html: `
        <div style="position: relative; width: 32px; height: 42px;">
          <div style="
            width: 32px; height: 32px;
            background: #ef4444; border: 3px solid white;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          "></div>
          <div style="
            position: absolute; top: 8px; left: 8px;
            width: 10px; height: 10px;
            background: white; border-radius: 50%;
          "></div>
        </div>`,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
    });
    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon, zIndexOffset: 900 }).addTo(map);
    } else {
      markerRef.current.setLatLng(position);
      markerRef.current.setIcon(icon);
    }
    return () => {
      if (markerRef.current) { markerRef.current.remove(); markerRef.current = null; }
    };
  }, [map, position]);

  return null;
}

export default function MapView({
  setCurrentLocation,
  selectedRoute = [],
  segments = [],
  navigationMode = false,
  startLocation = null,
}) {
  const [position, setPosition] = useState(null);
  const [autoFollow, setAutoFollow] = useState(false);
  const [heading, setHeading] = useState(0);
  const lastPosition = useRef(null);
  const mapRef = useRef(null);

  const getHeading = (lat1, lon1, lat2, lon2) => {
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
    const x =
      Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
      Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  };

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const newPos = [lat, lon];
        if (lastPosition.current) {
          setHeading(getHeading(lastPosition.current[0], lastPosition.current[1], lat, lon));
        }
        lastPosition.current = newPos;
        setPosition(newPos);
        setCurrentLocation(newPos);
      },
      (err) => console.warn("GPS error:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [setCurrentLocation]);

  if (!position) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <div className="text-center">
          <div className="text-2xl mb-2">📍</div>
          <p className="text-gray-600">Getting your location...</p>
        </div>
      </div>
    );
  }

  const startPoint  = selectedRoute.length > 0 ? selectedRoute[0] : null;
  const destination = selectedRoute.length > 0 ? selectedRoute[selectedRoute.length - 1] : null;

  const segmentColor = (risk) => {
    if (risk > 0.7) return "#ef4444";
    if (risk > 0.4) return "#f97316";
    return "#22c55e";
  };

  const handleRecenter = () => {
    setAutoFollow(true);
    if (mapRef.current) {
      const target = startLocation
        || (selectedRoute.length > 0 ? selectedRoute[0] : position);
      mapRef.current.flyTo(target, 16, { duration: 1 });
    }
  };

  return (
    /*
     * KEY FIX: In navigationMode, constrain the map to the LEFT portion of the screen
     * by applying `right: 320px`. The NavigationHUD panel occupies the right 320px.
     * Outside navigationMode, map fills the full screen as before.
     */
    <div
      className="relative h-full"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: navigationMode ? "320px" : "0px",
        transition: "right 0.3s ease",
        touchAction: "auto",
      }}
    >
      {/* Recenter button — only shown in nav mode when user has panned away */}
      {!autoFollow && navigationMode && (
        <button
          onClick={handleRecenter}
          style={{ zIndex: 1000 }}
          className="absolute top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 text-sm font-medium"
        >
          🎯 Recenter
        </button>
      )}

      <MapContainer
        center={position}
        zoom={15}
        scrollWheelZoom={true}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        zoomControl={true}
        tap={true}
        style={{ width: "100%", height: "100%", touchAction: "auto" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        <MapController
          position={position}
          selectedRoute={selectedRoute}
          navigationMode={navigationMode}
          autoFollow={autoFollow}
          setAutoFollow={setAutoFollow}
          mapRef={mapRef}
        />

        <RotatingMarker
          position={position}
          rotationAngle={heading}
          navigationMode={navigationMode}
        />

        {startPoint && <Marker position={startPoint} />}
        {destination && <RedMarker position={destination} />}

        {selectedRoute.length > 1 && segments.length === 0 && (
          <Polyline
            positions={selectedRoute}
            pathOptions={{ color: "#f97316", weight: 6, opacity: 0.9 }}
          />
        )}

        {segments.map((seg, i) => (
          <Polyline
            key={i}
            positions={seg.coords}
            pathOptions={{ color: segmentColor(seg.risk), weight: 6, opacity: 0.9 }}
          />
        ))}
      </MapContainer>
    </div>
  );
}