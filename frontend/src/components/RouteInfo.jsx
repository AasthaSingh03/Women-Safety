"use client";

import { useState } from "react";

export default function RouteInfo({ routes = [], onSelectRoute, setSegments }) {

  const [expanded, setExpanded] = useState(false);

  if (!routes.length) return null;

  const getColor = (score) => {

    if (score >= 80) return "border-green-500";
    if (score >= 60) return "border-blue-500";
    if (score >= 40) return "border-yellow-500";

    return "border-red-500";

  };

  const startNavigation = async (coords) => {

    onSelectRoute(coords);

    const res = await fetch("http://localhost:5000/api/route/segments", {

      method: "POST",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({ coords })

    });

    const data = await res.json();

    if (data.success) {
      setSegments(data.segments);
    }

  };

  return (

    <div className="fixed bottom-[8vh] left-0 w-full flex justify-center z-[300]">

      <div
        className={`w-[95%] max-w-md bg-white rounded-t-2xl shadow-xl flex flex-col transition-all duration-300 ${
          expanded ? "max-h-[75vh]" : "max-h-[220px]"
        }`}
      >

        <div className="flex items-center justify-between px-4 py-2 border-b">

          <span className="text-sm font-semibold text-gray-600">
            ROUTE OPTIONS
          </span>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-blue-600 font-medium"
          >
            {expanded ? "Minimize ▲" : "Expand ▼"}
          </button>

        </div>

        <div className="overflow-y-auto px-3 py-3 space-y-3">

          {routes.map((route, index) => {

            const color = getColor(route.safetyScore);

            return (

              <div
                key={index}
                className={`bg-gray-50 rounded-xl shadow-sm p-4 border-2 ${color}`}
              >

                <div className="flex justify-between mb-2">

                  <h3 className="font-semibold text-gray-800">
                    ⭐ Route {route.id}
                  </h3>

                  <span className="text-sm text-gray-500">
                    {route.distance} km • {route.time} min
                  </span>

                </div>

                <p className="text-sm mb-2 font-medium">

                  Safety Score:
                  <span className="ml-2 text-gray-800">
                    {route.safetyScore}/100
                  </span>

                </p>

                <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-700 mb-3">

                  <div>🚓 Police Nearby: {route.police}</div>
                  <div>💡 {route.lighting}</div>
                  <div>👥 {route.crowd} Crowd</div>
                  <div>⚠️ Risk Zones: {route.riskZones}</div>
                  <div>🏨 Hotels: {route.hotels}</div>
                  <div>🏥 Hospitals: {route.hospitals}</div>

                </div>

                <button
                  onClick={() => startNavigation(route.coords)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
                >
                  Start Navigation
                </button>

              </div>

            );

          })}

        </div>

      </div>

    </div>

  );

}