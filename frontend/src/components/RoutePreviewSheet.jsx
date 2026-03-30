"use client";

import { useState, useEffect } from "react";
const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export default function RoutePreviewSheet({ route, onStartRoute, onClose, mapRef }) {
  const [starting, setStarting] = useState(false);

  // ── FIT MAP to route bounds, offset for the 320px right panel ──
  useEffect(() => {
    if (!route?.coords?.length || !mapRef?.current) return;
    const map = mapRef.current;
    const L = window.L;
    if (!L) return;
    try {
      const bounds = L.latLngBounds(route.coords);
      // paddingTopLeft: normal, paddingBottomRight: extra 320px on right so route isn't hidden under panel
      map.fitBounds(bounds, {
        paddingTopLeft: [60, 60],
        paddingBottomRight: [380, 60], // 320px panel + 60px breathing room
        animate: true,
      });
    } catch {}
  }, [route, mapRef]);

  if (!route) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#2563eb";
    if (score >= 40) return "#d97706";
    return "#dc2626";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Safe";
    if (score >= 60) return "Good";
    if (score >= 40) return "Moderate";
    return "Risky";
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/route/segments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coords: route.coords, timeZone: route.timeZone || "day" }),
      });
      const data = await res.json();
      onStartRoute(route, data.success ? data.segments : []);
    } catch {
      onStartRoute(route, []);
    } finally {
      setStarting(false);
    }
  };

  return (
    <>
      {/* Transparent left backdrop — clicking closes the sheet, map stays interactive */}
      <div
        className="route-preview-backdrop"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 400, right: "320px" }}
      />

      {/*
        RIGHT PANEL
        Outer div: overflow hidden — never scrolls
        Inner layout: flex column with scrollable top section + sticky button at bottom
      */}
      <div
        className="route-preview-right-panel"
        style={{
          position: "fixed",
          top: 0, right: 0, bottom: 0,
          width: "320px",
          zIndex: 500,
          backgroundColor: "#0f172a",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.35)",
        }}
      >

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>

          {/* HEADER */}
          <div style={{
            padding: "20px 20px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          }}>
            <div>
              <div style={{ color: "#64748b", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "4px" }}>
                ROUTE {route.id} PREVIEW
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "28px", fontWeight: 700, color: "white" }}>{route.time} min</span>
                <span style={{ fontSize: "13px", color: "#64748b" }}>{route.distance} km</span>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "50%",
              width: "32px", height: "32px", fontSize: "14px", cursor: "pointer",
              color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>✕</button>
          </div>

          {/* SAFETY SCORE */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em" }}>SAFETY SCORE</span>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{
                  fontSize: "11px", fontWeight: 700,
                  color: getScoreColor(route.safetyScore),
                  backgroundColor: `${getScoreColor(route.safetyScore)}22`,
                  border: `1px solid ${getScoreColor(route.safetyScore)}44`,
                  borderRadius: "20px", padding: "2px 8px",
                }}>
                  {getScoreLabel(route.safetyScore)}
                </span>
                <span style={{ color: getScoreColor(route.safetyScore), fontSize: "18px", fontWeight: 700 }}>
                  {route.safetyScore}/100
                </span>
              </div>
            </div>
            <div style={{ height: "8px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${route.safetyScore}%`,
                backgroundColor: getScoreColor(route.safetyScore),
                borderRadius: "999px", transition: "width 0.5s ease",
              }} />
            </div>
          </div>

          {/* STATS GRID */}
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px",
          }}>
            {[
              { icon: "💡", label: "Lighting",   value: route.lighting,              warn: route.lighting === "Low Lighting" },
              { icon: "👥", label: "Crowd",      value: route.crowd,                 warn: route.crowd === "High" },
              { icon: "🚓", label: "Police",     value: `${route.police} nearby`,    warn: false },
              { icon: "🏥", label: "Hospitals",  value: `${route.hospitals} nearby`, warn: false },
              { icon: "⚠️", label: "Risk Zones", value: `${route.riskZones} zones`,  warn: route.riskZones > 2 },
            ].map((item) => (
              <div key={item.label} style={{
                backgroundColor: item.warn ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.04)",
                border: item.warn ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px", padding: "10px 12px",
              }}>
                <div style={{ fontSize: "16px", marginBottom: "4px" }}>{item.icon}</div>
                <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em" }}>
                  {item.label.toUpperCase()}
                </div>
                <div style={{ color: item.warn ? "#fcd34d" : "white", fontSize: "12px", fontWeight: 600, marginTop: "2px" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* SCORE LEGEND */}
          <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ color: "#64748b", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "8px" }}>
              SCORE GUIDE
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                { label: "Safe 80-100",    color: "#16a34a" },
                { label: "Good 60-79",     color: "#2563eb" },
                { label: "Moderate 40-59", color: "#d97706" },
                { label: "Risk 0-39",      color: "#dc2626" },
              ].map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: s.color }} />
                  <span style={{ color: "#94a3b8", fontSize: "10px" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* COMMUNITY WARNING */}
          {route.hasReports && (
            <div style={{
              margin: "12px 20px",
              backgroundColor: "rgba(239,68,68,0.10)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "10px", padding: "10px 12px",
              fontSize: "12px", color: "#fca5a5", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              ⚠️ Community-reported safety concerns on this route
            </div>
          )}

        </div>
        {/* ── END SCROLLABLE AREA ── */}

        {/* ── STICKY START BUTTON — pinned to bottom, never scrolls away ── */}
        <div style={{
          padding: "14px 20px 20px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "#0f172a",
          flexShrink: 0,
        }}>
          <button
            onClick={handleStart}
            disabled={starting}
            style={{
              width: "100%", padding: "14px",
              backgroundColor: starting ? "#1e40af" : "#2563eb",
              color: "white", border: "none", borderRadius: "14px",
              fontSize: "15px", fontWeight: 700,
              cursor: starting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              transition: "background-color 0.2s ease",
            }}
          >
            {starting ? "⏳ Preparing route..." : "▶  Start Navigation"}
          </button>
        </div>

      </div>

      <style>{`
        @media (max-width: 639px) {
          .route-preview-right-panel {
            top: auto !important;
            right: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-height: 70vh !important;
            border-radius: 20px 20px 0 0 !important;
            box-shadow: 0 -8px 32px rgba(0,0,0,0.4) !important;
          }
          .route-preview-backdrop {
            right: 0 !important;
            bottom: 30vh !important;
          }
        }
      `}</style>
    </>
  );
}