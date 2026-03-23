"use client";

import { useState } from "react";

export default function RoutePreviewSheet({ route, onStartRoute, onClose }) {

  const [starting, setStarting] = useState(false);

  if (!route) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#2563eb";
    if (score >= 40) return "#d97706";
    return "#dc2626";
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch("http://localhost:5000/api/route/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coords: route.coords, timeZone: route.timeZone || "day" }),
      });
      const data = await res.json();
      onStartRoute(route, data.success ? data.segments : []);
    } catch (err) {
      onStartRoute(route, []);
    } finally {
      setStarting(false);
    }
  };

  return (
    <>
      {/* Backdrop — only covers bottom sheet area, map stays visible */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 400 }}
        onClick={onClose}
      />

      {/* Compact bottom sheet — leaves top 55% for map */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        zIndex: 500, display: "flex", justifyContent: "center",
      }}>
        <div style={{
          width: "100%", maxWidth: "520px",
          backgroundColor: "#ffffff",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.2)",
          padding: "12px 20px 28px",
        }}>

          {/* Handle */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
            <div style={{ width: "40px", height: "4px", backgroundColor: "#e2e8f0", borderRadius: "999px" }} />
          </div>

          {/* Top row — time + close */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "24px", fontWeight: 700, color: "#1e293b" }}>{route.time} min</span>
              <span style={{ fontSize: "13px", color: "#64748b" }}>{route.distance} km · Route {route.id}</span>
            </div>
            <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "30px", height: "30px", fontSize: "14px", cursor: "pointer", color: "#64748b" }}>✕</button>
          </div>

          {/* Safety score bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", whiteSpace: "nowrap" }}>🛡️ Safety</span>
            <div style={{ flex: 1, height: "8px", backgroundColor: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${route.safetyScore}%`, backgroundColor: getScoreColor(route.safetyScore), borderRadius: "999px" }} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: 700, color: getScoreColor(route.safetyScore), whiteSpace: "nowrap" }}>
              {route.safetyScore}/100
            </span>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px", overflowX: "auto" }}>
            {[
              { icon: "💡", label: route.lighting },
              { icon: "👥", label: route.crowd    },
              { icon: "🚓", label: `Police: ${route.police}` },
              { icon: "🏥", label: `Hosp: ${route.hospitals}` },
              { icon: "⚠️", label: `Zones: ${route.riskZones}` },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: "#f8fafc", borderRadius: "20px", padding: "4px 10px", fontSize: "11px", fontWeight: 600, color: "#374151", border: "1px solid #e2e8f0", whiteSpace: "nowrap", flexShrink: 0 }}>
                <span>{item.icon}</span> {item.label}
              </div>
            ))}
          </div>

          {/* Community warning */}
          {route.hasReports && (
            <div style={{ backgroundColor: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "8px", padding: "6px 10px", marginBottom: "10px", fontSize: "11px", color: "#92400e", fontWeight: 600 }}>
              ⚠️ Community-reported safety concerns on this route
            </div>
          )}

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={starting}
            style={{
              width: "100%", padding: "14px",
              backgroundColor: starting ? "#93c5fd" : "#2563eb",
              color: "white", border: "none", borderRadius: "14px",
              fontSize: "16px", fontWeight: 700,
              cursor: starting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            {starting ? "⏳ Preparing..." : "▶  Start Navigation"}
          </button>

        </div>
      </div>
    </>
  );
}