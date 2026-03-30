// "use client";

// import { useState, useRef } from "react";
// import MapView from "../components/MapView";
// import SearchPanel from "../components/SearchPanel";
// import Header from "../components/Header";
// import Legend from "../components/Legend";
// import RouteInfo from "../components/RouteInfo";
// import RoutePreviewSheet from "../components/RoutePreviewSheet";
// import NavigationHUD from "../components/NavigationHUD";
// import ReportModal from "../components/ReportModal";

// export default function Home() {
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [destination, setDestination] = useState("");
//   const [routes, setRoutes] = useState([]);
//   const [selectedRoute, setSelectedRoute] = useState([]);
//   const [segments, setSegments] = useState([]);
//   const [navigationMode, setNavigationMode] = useState(false);
//   const [previewRoute, setPreviewRoute] = useState(null);
//   const [activeRouteId, setActiveRouteId] = useState(null);
//   const [estimatedTime, setEstimatedTime] = useState(0);
//   const [showReportModal, setShowReportModal] = useState(false);
//   const [startLocation, setStartLocation] = useState(null);

//   // ← Store active route's safety data to pass to NavigationHUD side panel
//   const [activeRouteSafety, setActiveRouteSafety] = useState(null);

//   const lastSearchRef = useRef(null);

//   const endNavigation = () => {
//     setNavigationMode(false);
//     setSelectedRoute([]);
//     setSegments([]);
//     setActiveRouteId(null);
//     setPreviewRoute(null);
//     setActiveRouteSafety(null);
//   };

//   const handlePreviewRoute = (route) => {
//     setPreviewRoute(route);
//     setSelectedRoute(route.coords);
//   };

//   const handleStartNavigation = (route, segs) => {
//     setPreviewRoute(null);
//     setSegments(segs);
//     setActiveRouteId(route.id);
//     setEstimatedTime(route.time);
//     setNavigationMode(true);
//     // ← Capture safety info for the HUD side panel
//     setActiveRouteSafety({
//       safetyScore: route.safetyScore,
//       lighting:    route.lighting,
//       crowd:       route.crowd,
//       police:      route.police,
//       hospitals:   route.hospitals,
//       riskZones:   route.riskZones,
//     });
//   };

//   const isUI = !navigationMode && !previewRoute;

//   return (
//     <div className="relative w-screen h-screen overflow-hidden">

//       {/*
//         MapView is absolutely positioned.
//         In navigationMode it shrinks to the left (right: 320px) via its own style.
//         Outside navigationMode it fills the full screen.
//       */}
//       <div className="absolute inset-0 z-0" style={{ touchAction: "auto" }}>
//         <MapView
//           setCurrentLocation={setCurrentLocation}
//           selectedRoute={selectedRoute}
//           segments={segments}
//           navigationMode={navigationMode}
//           startLocation={startLocation}
//         />
//       </div>

//       {/* UI overlays */}
//       <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>

//         {isUI && (
//           <div className="pointer-events-auto">
//             <Header />
//           </div>
//         )}

//         {isUI && (
//           <div className="pointer-events-auto">
//             <SearchPanel
//               destination={destination}
//               setDestination={setDestination}
//               setRoutes={setRoutes}
//               currentLocation={currentLocation}
//               lastSearchRef={lastSearchRef}
//               onStartLocationResolved={setStartLocation}
//             />
//           </div>
//         )}

//         {isUI && (
//           <div className="pointer-events-auto">
//             <Legend />
//           </div>
//         )}

//         {isUI && (
//           <div className="pointer-events-auto">
//             <RouteInfo
//               routes={routes}
//               setRoutes={setRoutes}
//               lastSearchRef={lastSearchRef}
//               onSelectRoute={(coords) => setSelectedRoute(coords)}
//               setSegments={setSegments}
//               setNavigationMode={setNavigationMode}
//               onPreviewRoute={handlePreviewRoute}
//             />
//           </div>
//         )}

//       </div>

//       {/* Route preview sheet (bottom sheet before starting navigation) */}
//       {previewRoute && !navigationMode && (
//         <RoutePreviewSheet
//           route={previewRoute}
//           onStartRoute={handleStartNavigation}
//           onClose={() => setPreviewRoute(null)}
//         />
//       )}

//       {/*
//         NavigationHUD renders a fixed overlay:
//         - Left side is transparent (map shows through)
//         - Right side (320px) is the dark navigation panel
//         MapView has already shifted right: 320px so nothing overlaps.
//       */}
//       {navigationMode && (
//         <NavigationHUD
//           position={currentLocation}
//           selectedRoute={selectedRoute}
//           estimatedTime={estimatedTime}
//           onEndNav={endNavigation}
//           onReport={() => setShowReportModal(true)}
//           // Safety data for the right panel
//           safetyScore={activeRouteSafety?.safetyScore}
//           lighting={activeRouteSafety?.lighting}
//           crowd={activeRouteSafety?.crowd}
//           police={activeRouteSafety?.police}
//           hospitals={activeRouteSafety?.hospitals}
//           riskZones={activeRouteSafety?.riskZones}
//         />
//       )}

//       {showReportModal && (
//         <ReportModal
//           position={currentLocation}
//           routeId={activeRouteId}
//           onClose={() => setShowReportModal(false)}
//         />
//       )}

//     </div>
//   );
// }

"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic"; // ✅ REQUIRED

// ✅ FIX: Disable SSR for MapView
const MapView = dynamic(() => import("../components/MapView"), {
  ssr: false,
});

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

  const [activeRouteSafety, setActiveRouteSafety] = useState(null);

  const lastSearchRef = useRef(null);

  const endNavigation = () => {
    setNavigationMode(false);
    setSelectedRoute([]);
    setSegments([]);
    setActiveRouteId(null);
    setPreviewRoute(null);
    setActiveRouteSafety(null);
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

    setActiveRouteSafety({
      safetyScore: route.safetyScore,
      lighting: route.lighting,
      crowd: route.crowd,
      police: route.police,
      hospitals: route.hospitals,
      riskZones: route.riskZones,
    });
  };

  const isUI = !navigationMode && !previewRoute;

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      
      {/* Map */}
      <div className="absolute inset-0 z-0" style={{ touchAction: "auto" }}>
        <MapView
          setCurrentLocation={setCurrentLocation}
          selectedRoute={selectedRoute}
          segments={segments}
          navigationMode={navigationMode}
          startLocation={startLocation}
        />
      </div>

      {/* UI overlays */}
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

      {/* Route Preview */}
      {previewRoute && !navigationMode && (
        <RoutePreviewSheet
          route={previewRoute}
          onStartRoute={handleStartNavigation}
          onClose={() => setPreviewRoute(null)}
        />
      )}

      {/* Navigation HUD */}
      {navigationMode && (
        <NavigationHUD
          position={currentLocation}
          selectedRoute={selectedRoute}
          estimatedTime={estimatedTime}
          onEndNav={endNavigation}
          onReport={() => setShowReportModal(true)}
          safetyScore={activeRouteSafety?.safetyScore}
          lighting={activeRouteSafety?.lighting}
          crowd={activeRouteSafety?.crowd}
          police={activeRouteSafety?.police}
          hospitals={activeRouteSafety?.hospitals}
          riskZones={activeRouteSafety?.riskZones}
        />
      )}

      {/* Report Modal */}
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