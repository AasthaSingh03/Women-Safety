"use client";

import { useState, useRef } from "react";
import MapView from "../components/MapView";
import SearchPanel from "../components/SearchPanel";
import Header from "../components/Header";
import Legend from "../components/Legend";
import RouteInfo from "../components/RouteInfo";
import RoutePreviewSheet from "../components/RoutePreviewSheet";
import NavigationHUD from "../components/NavigationHUD";
import ReportModal from "../components/ReportModal";

export default function Home() {

  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState("");
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [segments, setSegments] = useState([]);
  const [navigationMode, setNavigationMode] = useState(false);
  const [previewRoute, setPreviewRoute] = useState(null);
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [startLocation, setStartLocation] = useState(null);

  const lastSearchRef = useRef(null);

  const endNavigation = () => {
    setNavigationMode(false);
    setSelectedRoute([]);
    setSegments([]);
    setActiveRouteId(null);
    setPreviewRoute(null);
  };

  const handlePreviewRoute = (route) => {
    setPreviewRoute(route);
    setSelectedRoute(route.coords);
  };

  const handleStartNavigation = (route, segs) => {
    setPreviewRoute(null);
    setSegments(segs);
    setActiveRouteId(route.id);
    setEstimatedTime(route.time);
    setNavigationMode(true);
  };

  const isUI = !navigationMode && !previewRoute;

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      <div className="absolute inset-0 z-0" style={{ touchAction: "auto" }}>
        <MapView
          setCurrentLocation={setCurrentLocation}
          selectedRoute={selectedRoute}
          segments={segments}
          navigationMode={navigationMode}
          startLocation={startLocation}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>

        {isUI && (
          <div className="pointer-events-auto">
            <Header />
          </div>
        )}

        {isUI && (
          <div className="pointer-events-auto">
            <SearchPanel
              destination={destination}
              setDestination={setDestination}
              setRoutes={setRoutes}
              currentLocation={currentLocation}
              lastSearchRef={lastSearchRef}
              onStartLocationResolved={setStartLocation}
            />
          </div>
        )}

        {isUI && (
          <div className="pointer-events-auto">
            <Legend />
          </div>
        )}

        {isUI && (
          <div className="pointer-events-auto">
            <RouteInfo
              routes={routes}
              setRoutes={setRoutes}
              lastSearchRef={lastSearchRef}
              onSelectRoute={(coords) => setSelectedRoute(coords)}
              setSegments={setSegments}
              setNavigationMode={setNavigationMode}
              onPreviewRoute={handlePreviewRoute}
            />
          </div>
        )}

      </div>

      {previewRoute && !navigationMode && (
        <RoutePreviewSheet
          route={previewRoute}
          onStartRoute={handleStartNavigation}
          onClose={() => setPreviewRoute(null)}
        />
      )}

      {navigationMode && (
        <NavigationHUD
          position={currentLocation}
          selectedRoute={selectedRoute}
          estimatedTime={estimatedTime}
          onEndNav={endNavigation}
          onReport={() => setShowReportModal(true)}
        />
      )}

      {showReportModal && (
        <ReportModal
          position={currentLocation}
          routeId={activeRouteId}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  );
}