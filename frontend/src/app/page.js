// "use client";

// import { useState } from "react";
// import MapView from "../components/MapView";
// import SearchPanel from "../components/SearchPanel";
// import SOSButton from "../components/SOSButton";
// import Header from "../components/Header";
// import Legend from "../components/Legend";
// import RouteInfo from "../components/RouteInfo";

// export default function Home() {

//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [destination, setDestination] = useState("");
//   const [routes, setRoutes] = useState([]);
//   const [selectedRoute, setSelectedRoute] = useState([]);
//   const [segments, setSegments] = useState([]);
//   const [navigationMode, setNavigationMode] = useState(false);

//   const endNavigation = () => {
//     setNavigationMode(false);
//     setSelectedRoute([]);
//     setSegments([]);
//   };

//   return (
//     <div className="relative w-screen h-screen overflow-hidden">

//       {/* MAP LAYER */}
//       <div
//         className="absolute inset-0 z-0"
//         style={{ touchAction: "auto" }}
//       >
//         <MapView
//           setCurrentLocation={setCurrentLocation}
//           selectedRoute={selectedRoute}
//           segments={segments}
//           navigationMode={navigationMode}
//         />
//       </div>

//       {/* UI LAYER */}
//       <div className="absolute inset-0 z-50 pointer-events-none">

//         {/* Header — fixed at top */}
//         {!navigationMode && (
//           <div className="pointer-events-auto w-full">
//             <Header />
//           </div>
//         )}

//         {/* End Navigation Button */}
//         {navigationMode && (
//           <div className="pointer-events-auto absolute top-4 right-4">
//             <button
//               onClick={endNavigation}
//               className="bg-white shadow-lg px-4 py-2 rounded-lg text-sm font-semibold"
//             >
//               ❌ End Navigation
//             </button>
//           </div>
//         )}

//         {/* Search Panel — sits below header */}
//         {!navigationMode && (
//           <div className="pointer-events-auto">
//             <SearchPanel
//               destination={destination}
//               setDestination={setDestination}
//               setRoutes={setRoutes}
//               currentLocation={currentLocation}
//             />
//           </div>
//         )}

//         {/* Legend */}
//         {!navigationMode && (
//           <div className="pointer-events-auto">
//             <Legend />
//           </div>
//         )}

//         {/* Routes */}
//         {!navigationMode && (
//           <div className="pointer-events-auto">
//             <RouteInfo
//               routes={routes}
//               onSelectRoute={(coords) => setSelectedRoute(coords)}
//               setSegments={setSegments}
//               setNavigationMode={setNavigationMode}
//             />
//           </div>
//         )}

//         {/* SOS */}
//         {!navigationMode && (
//           <div className="pointer-events-auto">
//             <SOSButton />
//           </div>
//         )}

//       </div>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
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

  const endNavigation = () => {
    setNavigationMode(false);
    setSelectedRoute([]);
    setSegments([]);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      {/* MAP LAYER */}
      <div className="absolute inset-0 z-0" style={{ touchAction: "auto" }}>
        <MapView
          setCurrentLocation={setCurrentLocation}
          selectedRoute={selectedRoute}
          segments={segments}
          navigationMode={navigationMode}
        />
      </div>

      {/* UI LAYER — pointer-events-none so map gets all touches */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 50 }}
      >

        {/* Header — fully visible at top */}
        {!navigationMode && (
          <div className="pointer-events-auto">
            <Header />
          </div>
        )}

        {/* End Navigation Button */}
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

        {/* Route Options */}
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

      </div>
    </div>
  );
}