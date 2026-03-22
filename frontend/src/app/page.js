"use client";

import { useState, useRef } from "react";
import MapView from "../components/MapView";
import SearchPanel from "../components/SearchPanel";
import Header from "../components/Header";
import Legend from "../components/Legend";
import RouteInfo from "../components/RouteInfo";

export default function Home() {

  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [segments, setSegments] = useState([]);
  const [navigationMode, setNavigationMode] = useState(false);

  const lastSearchRef = useRef(null); // ← stores coords for timezone toggle

  const endNavigation = () => {
    setNavigationMode(false);
    setSelectedRoute([]);
    setSegments([]);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      <div className="absolute inset-0 z-0" style={{ touchAction: "auto" }}>
        <MapView
          setCurrentLocation={setCurrentLocation}
          selectedRoute={selectedRoute}
          segments={segments}
          navigationMode={navigationMode}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>

        {!navigationMode && (
          <div className="pointer-events-auto">
            <Header />
          </div>
        )}

        {navigationMode && (
          <div className="pointer-events-auto absolute top-4 right-4">
            <button
              onClick={endNavigation}
              className="bg-white shadow-lg px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200"
            >
              ❌ End Navigation
            </button>
          </div>
        )}

        {!navigationMode && (
          <div className="pointer-events-auto">
            <SearchPanel
              destination={destination}
              setDestination={setDestination}
              setRoutes={setRoutes}
              currentLocation={currentLocation}
              lastSearchRef={lastSearchRef}
            />
          </div>
        )}

        {!navigationMode && (
          <div className="pointer-events-auto">
            <Legend />
          </div>
        )}

        {!navigationMode && (
          <div className="pointer-events-auto">
            <RouteInfo
              routes={routes}
              setRoutes={setRoutes}
              lastSearchRef={lastSearchRef}
              onSelectRoute={(coords) => setSelectedRoute(coords)}
              setSegments={setSegments}
              setNavigationMode={setNavigationMode}
            />
          </div>
        )}

      </div>
    </div>
  );
}