"use client";
import { useState, useEffect } from "react";

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

export default function NavigationHUD({ position, selectedRoute, estimatedTime, onEndNav, onReport }) {

  const [remaining, setRemaining] = useState({ dist: 0, time: 0 });
  const [hasCommunityWarning, setHasCommunityWarning] = useState(false);

  useEffect(() => {
    if (!position || !selectedRoute?.length) return;

    // Find closest point on route
    let minDist = Infinity, closestIdx = 0;
    selectedRoute.forEach(([lat, lng], i) => {
      const d = getDistance(position[0], position[1], lat, lng);
      if (d < minDist) { minDist = d; closestIdx = i; }
    });

    // Remaining distance
    let remDist = 0;
    for (let i = closestIdx; i < selectedRoute.length - 1; i++) {
      remDist += getDistance(
        selectedRoute[i][0], selectedRoute[i][1],
        selectedRoute[i+1][0], selectedRoute[i+1][1]
      );
    }

    const remKm = (remDist / 1000).toFixed(1);
    const remMin = Math.round((remDist / 1000) / 30 * 60); // assume 30km/h
    setRemaining({ dist: remKm, time: remMin });

    // Check community reports nearby
    const checkReports = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/reports/nearby?lat=${position[0]}&lon=${position[1]}&radius=300`);
        const data = await res.json();
        setHasCommunityWarning(data.reports?.length > 0);
      } catch {}
    };
    checkReports();
  }, [position, selectedRoute]);

  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 500, pointerEvents: "none" }}>

      {/* Community warning banner */}
      {hasCommunityWarning && (
        <div style={{
          margin: "0 16px 8px",
          backgroundColor: "#fef2f2",
          border: "1px solid #fca5a5",
          borderRadius: "12px",
          padding: "8px 12px",
          fontSize: "12px",
          color: "#dc2626",
          fontWeight: 600,
          pointerEvents: "auto",
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          ⚠️ Community-reported safety concerns on this route
        </div>
      )}

      {/* HUD bar */}
      <div style={{
        backgroundColor: "#1e293b",
        padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        pointerEvents: "auto",
      }}>

        {/* ETA + Distance */}
        <div>
          <div style={{ color: "white", fontSize: "22px", fontWeight: 700 }}>
            {remaining.time} min
          </div>
          <div style={{ color: "#94a3b8", fontSize: "13px" }}>
            {remaining.dist} km remaining
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onReport} style={{
            backgroundColor: "#f59e0b", color: "white",
            border: "none", borderRadius: "10px",
            padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
          }}>
            ⚠️ Report
          </button>
          <button onClick={onEndNav} style={{
            backgroundColor: "#ef4444", color: "white",
            border: "none", borderRadius: "10px",
            padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer",
          }}>
            ✕ End
          </button>
        </div>
      </div>
    </div>
  );
}