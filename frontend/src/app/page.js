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

  return (

    <div className="relative w-screen h-screen">

      <Header />

      <div className="absolute inset-0 z-0 h-full w-full">

        <MapView
          setCurrentLocation={setCurrentLocation}
          selectedRoute={selectedRoute}
          segments={segments}
        />

      </div>

      <div className="absolute inset-0 z-50">

        <div className="pointer-events-auto">

          <SearchPanel
            destination={destination}
            setDestination={setDestination}
            setRoutes={setRoutes}
            currentLocation={currentLocation}
          />

        </div>

        <Legend />

        <RouteInfo
          routes={routes}
          onSelectRoute={(coords) => setSelectedRoute(coords)}
          setSegments={setSegments}
        />

        <SOSButton />
        <BottomNav />

      </div>

    </div>

  );

}