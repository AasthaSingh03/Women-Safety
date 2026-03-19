// // "use client";

// // import { useState } from "react";

// // export default function RouteInfo({
// //   routes = [],
// //   onSelectRoute,
// //   setSegments,
// //   setNavigationMode
// // }) {

// //   const [expanded, setExpanded] = useState(false);

// //   if (!routes.length) return null;

// //   const getColor = (score) => {

// //     if (score >= 80) return "border-green-500";
// //     if (score >= 60) return "border-blue-500";
// //     if (score >= 40) return "border-yellow-500";

// //     return "border-red-500";

// //   };

// //   const startNavigation = async (coords) => {

// //     /* activate navigation mode */
// //     if (setNavigationMode) setNavigationMode(true);

// //     /* show route */
// //     onSelectRoute(coords);

// //     try {

// //       const res = await fetch("http://localhost:5000/api/route/segments", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({ coords })
// //       });

// //       const data = await res.json();

// //       if (data.success) {
// //         setSegments(data.segments);
// //       }

// //     } catch (err) {
// //       console.error("Segment fetch error:", err);
// //     }

// //   };

// //   return (

// //     <div className="fixed bottom-[8vh] left-0 w-full flex justify-center z-[300]">

// //       <div
// //         className={`w-[95%] max-w-md bg-white rounded-t-2xl shadow-xl flex flex-col transition-all duration-300 ${
// //           expanded ? "max-h-[75vh]" : "max-h-[220px]"
// //         }`}
// //       >

// //         {/* HEADER */}
// //         <div className="flex items-center justify-between px-4 py-2 border-b">

// //           <span className="text-sm font-semibold text-gray-600">
// //             ROUTE OPTIONS
// //           </span>

// //           <button
// //             onClick={() => setExpanded(!expanded)}
// //             className="text-sm text-blue-600 font-medium"
// //           >
// //             {expanded ? "Minimize ▲" : "Expand ▼"}
// //           </button>

// //         </div>

// //         {/* ROUTES */}
// //         <div className="overflow-y-auto px-3 py-3 space-y-3">

// //           {routes.map((route, index) => {

// //             const color = getColor(route.safetyScore);

// //             return (

// //               <div
// //                 key={index}
// //                 className={`bg-gray-50 rounded-xl shadow-sm p-4 border-2 ${color}`}
// //               >

// //                 {/* Route Header */}
// //                 <div className="flex justify-between mb-2">

// //                   <h3 className="font-semibold text-gray-800">
// //                     ⭐ Route {route.id}
// //                   </h3>

// //                   <span className="text-sm text-gray-500">
// //                     {route.distance} km • {route.time} min
// //                   </span>

// //                 </div>

// //                 {/* Safety Score */}
// //                 <p className="text-sm mb-2 font-medium">

// //                   Safety Score:
// //                   <span className="ml-2 text-gray-800">
// //                     {route.safetyScore}/100
// //                   </span>

// //                 </p>

// //                 {/* Indicators */}
// //                 <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-700 mb-3">

// //                   <div>🚓 Police Nearby: {route.police}</div>
// //                   <div>💡 {route.lighting}</div>
// //                   <div>👥 {route.crowd} Crowd</div>
// //                   <div>⚠️ Risk Zones: {route.riskZones}</div>
// //                   <div>🏨 Hotels: {route.hotels}</div>
// //                   <div>🏥 Hospitals: {route.hospitals}</div>

// //                 </div>

// //                 {/* Start Navigation */}
// //                 <button
// //                   onClick={() => startNavigation(route.coords)}
// //                   className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
// //                 >
// //                   Start Navigation
// //                 </button>

// //               </div>

// //             );

// //           })}

// //         </div>

// //       </div>

// //     </div>

// //   );

// // }


// "use client";

// import { useState } from "react";

// export default function RouteInfo({
//   routes = [],
//   onSelectRoute,
//   setSegments,
//   setNavigationMode
// }) {

//   const [expanded, setExpanded] = useState(false);

//   if (!routes.length) return null;

//   const getColor = (score) => {
//     if (score >= 80) return "border-green-500";
//     if (score >= 60) return "border-blue-500";
//     if (score >= 40) return "border-yellow-500";
//     return "border-red-500";
//   };

//   const startNavigation = async (coords) => {
//     if (setNavigationMode) setNavigationMode(true);
//     onSelectRoute(coords);
//     try {
//       const res = await fetch("http://localhost:5000/api/route/segments", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ coords })
//       });
//       const data = await res.json();
//       if (data.success) setSegments(data.segments);
//     } catch (err) {
//       console.error("Segment fetch error:", err);
//     }
//   };

//   return (
//     <div className="fixed bottom-0 left-0 w-full flex justify-center z-[300]">
//       <div
//         className={`w-[95%] max-w-md bg-white rounded-t-2xl shadow-xl flex flex-col transition-all duration-300 ${
//           expanded ? "max-h-[70vh]" : "max-h-[220px]"
//         }`}
//       >

//         {/* HEADER */}
//         <div className="flex items-center justify-between px-4 py-2 border-b shrink-0">
//           <span className="text-sm font-semibold text-gray-600">ROUTE OPTIONS</span>
//           <button
//             onClick={() => setExpanded(!expanded)}
//             className="text-sm text-blue-600 font-medium"
//           >
//             {expanded ? "Minimize ▲" : "Expand ▼"}
//           </button>
//         </div>

//         {/* ROUTES LIST */}
//         <div className="overflow-y-auto px-3 py-3 space-y-3">
//           {routes.map((route, index) => (
//             <div
//               key={index}
//               className={`bg-gray-50 rounded-xl shadow-sm p-4 border-2 ${getColor(route.safetyScore)}`}
//             >
//               <div className="flex justify-between mb-2">
//                 <h3 className="font-semibold text-gray-800">⭐ Route {route.id}</h3>
//                 <span className="text-sm text-gray-500">
//                   {route.distance} km • {route.time} min
//                 </span>
//               </div>

//               <p className="text-sm mb-2 font-medium">
//                 Safety Score:
//                 <span className="ml-2 text-gray-800">{route.safetyScore}/100</span>
//               </p>

//               <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-700 mb-3">
//                 <div>🚓 Police Nearby: {route.police}</div>
//                 <div>💡 {route.lighting}</div>
//                 <div>👥 {route.crowd} Crowd</div>
//                 <div>⚠️ Risk Zones: {route.riskZones}</div>
//                 <div>🏨 Hotels: {route.hotels}</div>
//                 <div>🏥 Hospitals: {route.hospitals}</div>
//               </div>

//               <button
//                 onClick={() => startNavigation(route.coords)}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
//               >
//                 Start Navigation
//               </button>
//             </div>
//           ))}
//         </div>

//       </div>
//     </div>
//   );
// }


"use client";

import { useState } from "react";

export default function RouteInfo({
  routes = [],
  onSelectRoute,
  setSegments,
  setNavigationMode
}) {

  const [expanded, setExpanded] = useState(false);

  if (!routes.length) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return { border: "#22c55e", bg: "#f0fdf4", badge: "#16a34a" };
    if (score >= 60) return { border: "#3b82f6", bg: "#eff6ff", badge: "#2563eb" };
    if (score >= 40) return { border: "#f59e0b", bg: "#fffbeb", badge: "#d97706" };
    return { border: "#ef4444", bg: "#fef2f2", badge: "#dc2626" };
  };

  const startNavigation = async (coords) => {
    if (setNavigationMode) setNavigationMode(true);
    onSelectRoute(coords);
    try {
      const res = await fetch("http://localhost:5000/api/route/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coords })
      });
      const data = await res.json();
      if (data.success) setSegments(data.segments);
    } catch (err) {
      console.error("Segment fetch error:", err);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 300,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: expanded ? "100%" : "480px",
          maxHeight: expanded ? "55vh" : "200px",
          backgroundColor: "#ffffff",
          borderRadius: expanded ? "20px 20px 0 0" : "20px 20px 0 0",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          pointerEvents: "auto",
          overflow: "hidden",
        }}
      >

        {/* DRAG HANDLE */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: "10px",
          paddingBottom: "4px",
        }}>
          <div style={{
            width: "40px",
            height: "4px",
            backgroundColor: "#e2e8f0",
            borderRadius: "999px",
          }} />
        </div>

        {/* HEADER */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px 10px",
          borderBottom: "1px solid #f1f5f9",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "#64748b",
              textTransform: "uppercase",
            }}>
              Route Options
            </span>
            <span style={{
              backgroundColor: "#3b82f6",
              color: "white",
              fontSize: "11px",
              fontWeight: 600,
              padding: "1px 8px",
              borderRadius: "999px",
            }}>
              {routes.length}
            </span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#3b82f6",
              background: "#eff6ff",
              border: "none",
              borderRadius: "999px",
              padding: "4px 12px",
              cursor: "pointer",
            }}
          >
            {expanded ? "▼ Collapse" : "▲ Expand"}
          </button>
        </div>

        {/* ROUTES LIST */}
        <div style={{
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}>
          {routes.map((route, index) => {
            const colors = getScoreColor(route.safetyScore);
            return (
              <div
                key={index}
                style={{
                  backgroundColor: colors.bg,
                  border: `2px solid ${colors.border}`,
                  borderRadius: "16px",
                  padding: "14px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >

                {/* Route Title Row */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "16px" }}>⭐</span>
                    <span style={{ fontWeight: 700, fontSize: "15px", color: "#1e293b" }}>
                      Route {route.id}
                    </span>
                  </div>
                  <div style={{
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                  }}>
                    <span style={{
                      fontSize: "12px",
                      color: "#64748b",
                      background: "white",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      border: "1px solid #e2e8f0",
                    }}>
                      📍 {route.distance} km
                    </span>
                    <span style={{
                      fontSize: "12px",
                      color: "#64748b",
                      background: "white",
                      padding: "2px 8px",
                      borderRadius: "999px",
                      border: "1px solid #e2e8f0",
                    }}>
                      ⏱ {route.time} min
                    </span>
                  </div>
                </div>

                {/* Safety Score Badge */}
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: colors.badge,
                  color: "white",
                  fontSize: "12px",
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: "999px",
                  marginBottom: "10px",
                }}>
                  🛡️ Safety Score: {route.safetyScore}/100
                </div>

                {/* Indicators Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "6px",
                  marginBottom: "12px",
                }}>
                  {[
                    { icon: "🚓", label: "Police", value: route.police },
                    { icon: "💡", label: "Lighting", value: route.lighting },
                    { icon: "👥", label: "Crowd", value: route.crowd },
                    { icon: "⚠️", label: "Risk Zones", value: route.riskZones },
                    { icon: "🏨", label: "Hotels", value: route.hotels },
                    { icon: "🏥", label: "Hospitals", value: route.hospitals },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        padding: "5px 8px",
                        fontSize: "12px",
                        color: "#374151",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <span style={{ fontSize: "13px" }}>{item.icon}</span>
                      <span style={{ color: "#94a3b8", fontSize: "11px" }}>{item.label}:</span>
                      <span style={{ fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Start Navigation Button */}
                <button
                  onClick={() => startNavigation(route.coords)}
                  style={{
                    width: "100%",
                    backgroundColor: "#2563eb",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "10px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = "#1d4ed8"}
                  onMouseLeave={e => e.target.style.backgroundColor = "#2563eb"}
                >
                  🧭 Start Navigation
                </button>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}