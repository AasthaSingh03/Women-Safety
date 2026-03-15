"use client";

import { useState } from "react";
import MapView from "../components/MapView";
import SearchPanel from "../components/SearchPanel";
import SOSButton from "../components/SOSButton";
import Header from "../components/Header";
import Legend from "../components/Legend";
import RouteInfo from "../components/RouteInfo";
import BottomNav from "../components/BottomNav";

export default function Home() {

  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState("");

  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState([]);

  const [segments, setSegments] = useState([]);

  const [navigationMode, setNavigationMode] = useState(false);

  const endNavigation = () => {

    setNavigationMode(false);
    setSelectedRoute([]);
    setSegments([]);

  };

  return (

    <div className="relative w-screen h-screen">

      {/* Header */}
      {!navigationMode && <Header />}

      {/* Map */}
      <div className="absolute inset-0 z-0 h-full w-full">

        <MapView
          setCurrentLocation={setCurrentLocation}
          selectedRoute={selectedRoute}
          segments={segments}
        />

      </div>

      {/* End Navigation Button */}
      {navigationMode && (

        <button
          onClick={endNavigation}
          className="absolute top-4 right-4 z-[500] bg-white shadow-lg px-4 py-2 rounded-lg text-sm font-semibold"
        >
          ❌ End Navigation
        </button>

      )}

      {/* UI Layer */}
      <div className="absolute inset-0 z-50">

        {/* Search Panel */}
        {!navigationMode && (

          <div className="pointer-events-auto">

            <SearchPanel
              destination={destination}
              setDestination={setDestination}
              setRoutes={setRoutes}
              currentLocation={currentLocation}
            />

          </div>

        )}

        {/* Legend */}
        {!navigationMode && (

          <div className="pointer-events-auto">
            <Legend />
          </div>

        )}

        {/* Routes */}
        {!navigationMode && (

          <div className="pointer-events-auto">

            <RouteInfo
              routes={routes}
              onSelectRoute={(coords) => setSelectedRoute(coords)}
              setSegments={setSegments}
              setNavigationMode={setNavigationMode}
            />

          </div>

        )}

        {/* SOS */}
        {!navigationMode && (

          <div className="pointer-events-auto">
            <SOSButton />
          </div>

        )}

        {/* Bottom Nav */}
        {!navigationMode && (

          <div className="pointer-events-auto">
            <BottomNav />
          </div>

        )}

      </div>

    </div>

  );

}