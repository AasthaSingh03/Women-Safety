"use client";

import { useState } from "react";

const getAutoZone = () => {
  const h = new Date().getHours();
  if (h >= 23 || h < 6) return "night";
  if (h >= 17) return "evening";
  return "day";
};

const ZONE_CONFIG = {
  day:     { label: "☀️ Day",     bg: "#fef9c3", color: "#854d0e", darkBg: "#1e1b4b", darkColor: "#fde68a" },
  evening: { label: "🌆 Evening", bg: "#fff7ed", color: "#9a3412", darkBg: "#431407", darkColor: "#fdba74" },
  night:   { label: "🌙 Night",   bg: "#1e1b4b", color: "#a5b4fc", darkBg: "#1e1b4b", darkColor: "#a5b4fc" },
};

export default function RouteInfo({
  routes = [],
  onSelectRoute,
  setSegments,
  setNavigationMode,
  setRoutes,
  lastSearchRef,
}) {

  const [expanded, setExpanded] = useState(false);
  const [timeZone, setTimeZone] = useState(getAutoZone());
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  if (!routes.length) return null;

  const isNight = timeZone === "night";

  const getScoreColor = (score) => {
    if (score >= 80) return { border: "#22c55e", bg: "#f0fdf4", badge: "#16a34a" };
    if (score >= 60) return { border: "#3b82f6", bg: "#eff6ff", badge: "#2563eb" };
    if (score >= 40) return { border: "#f59e0b", bg: "#fffbeb", badge: "#d97706" };
    return { border: "#ef4444", bg: "#fef2f2", badge: "#dc2626" };
  };

  const tooltipData = {
    Lighting: {
      title: "💡 Lighting Levels",
      ranges: [
        { label: "Low Lighting", range: "0–2 lamps", color: "#ef4444" },
        { label: "Moderate",     range: "3–5 lamps", color: "#f59e0b" },
        { label: "Well Lit",     range: "6+ lamps",  color: "#22c55e" },
      ],
    },
    Crowd: {
      title: "👥 Crowd Levels",
      ranges: [
        { label: "Low",      range: "0–3 places", color: "#ef4444" },
        { label: "Moderate", range: "4–8 places", color: "#f59e0b" },
        { label: "High",     range: "9+ places",  color: "#22c55e" },
      ],
    },
  };

  const handleInfoClick = (e, label, value) => {
    if (!tooltipData[label]) return;
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ type: label, value, x: rect.left, y: rect.top });
  };

  const handleToggle = async () => {
    const next = timeZone === "day" ? "evening" : timeZone === "evening" ? "night" : "day";
    setTimeZone(next);
    if (!lastSearchRef?.current) return;
    const { startCoords, destCoords } = lastSearchRef.current;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/route/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: startCoords, destination: destCoords, timeZone: next }),
      });
      const data = await res.json();
      if (data.success && setRoutes) setRoutes(data.routes);
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startNavigation = async (coords) => {
    if (setNavigationMode) setNavigationMode(true);
    onSelectRoute(coords);
    try {
      const res = await fetch("http://localhost:5000/api/route/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coords, timeZone })
      });
      const data = await res.json();
      if (data.success) setSegments(data.segments);
    } catch (err) {
      console.error("Segment error:", err);
    }
  };

  const zc = ZONE_CONFIG[timeZone];
  const panelBg = isNight ? "#0f172a" : timeZone === "evening" ? "#0f172a" : "#ffffff";
  const borderColor = isNight || timeZone === "evening" ? "#1e293b" : "#f1f5f9";

  return (
    <div
      style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 300, display: "flex", justifyContent: "center", alignItems: "flex-end", pointerEvents: "none" }}
      onClick={() => setTooltip(null)}
    >

      {/* TOOLTIP */}
      {tooltip && (
        <div style={{
          position: "fixed",
          top: Math.max(tooltip.y - 160, 10),
          left: Math.min(tooltip.x, window.innerWidth - 220),
          zIndex: 999,
          backgroundColor: isNight ? "#1e293b" : "white",
          border: `1px solid ${isNight ? "#334155" : "#e2e8f0"}`,
          borderRadius: "12px", padding: "12px", width: "200px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)", pointerEvents: "auto",
        }} onClick={e => e.stopPropagation()}>
          <div style={{ fontWeight: 700, fontSize: "12px", marginBottom: "8px", color: isNight ? "#f1f5f9" : "#1e293b" }}>
            {tooltipData[tooltip.type].title}
          </div>
          <div style={{ backgroundColor: isNight ? "#0f172a" : "#f8fafc", borderRadius: "8px", padding: "6px 10px", marginBottom: "8px", fontSize: "11px", color: isNight ? "#94a3b8" : "#64748b" }}>
            Current: <span style={{ fontWeight: 700, color: isNight ? "#e2e8f0" : "#1e293b" }}>{tooltip.value}</span>
          </div>
          {tooltipData[tooltip.type].ranges.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0", borderBottom: i < 2 ? `1px solid ${isNight ? "#334155" : "#f1f5f9"}` : "none" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: r.color, flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: isNight ? "#e2e8f0" : "#374151" }}>{r.label}</span>
                <span style={{ fontSize: "10px", color: isNight ? "#64748b" : "#94a3b8", marginLeft: "4px" }}>({r.range})</span>
              </div>
            </div>
          ))}
          <button onClick={() => setTooltip(null)} style={{ marginTop: "8px", width: "100%", fontSize: "11px", color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            Close
          </button>
        </div>
      )}

      <div style={{
        width: "100%",
        maxWidth: expanded ? "100%" : "480px",
        maxHeight: expanded ? "55vh" : "230px",
        backgroundColor: panelBg,
        borderRadius: "20px 20px 0 0",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: "auto", overflow: "hidden",
      }}>

        {/* DRAG HANDLE */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "10px", paddingBottom: "4px" }}>
          <div style={{ width: "40px", height: "4px", backgroundColor: isNight ? "#334155" : "#e2e8f0", borderRadius: "999px" }} />
        </div>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 16px 8px", borderBottom: `1px solid ${borderColor}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: isNight ? "#94a3b8" : "#64748b", textTransform: "uppercase" }}>
              Route Options
            </span>
            <span style={{ backgroundColor: "#3b82f6", color: "white", fontSize: "11px", fontWeight: 600, padding: "1px 8px", borderRadius: "999px" }}>
              {routes.length}
            </span>

            {/* 3-state toggle */}
            <button onClick={handleToggle} disabled={loading} style={{
              fontSize: "11px", fontWeight: 600,
              backgroundColor: isNight ? zc.darkBg : zc.bg,
              color: isNight ? zc.darkColor : zc.color,
              border: "none", borderRadius: "999px", padding: "3px 10px",
              cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
            }}>
              {loading ? "⏳" : zc.label}
            </button>
          </div>

          <button onClick={() => setExpanded(!expanded)} style={{
            fontSize: "12px", fontWeight: 600, color: "#3b82f6",
            background: isNight ? "#1e293b" : "#eff6ff",
            border: "none", borderRadius: "999px", padding: "4px 12px", cursor: "pointer",
          }}>
            {expanded ? "▼ Collapse" : "▲ Expand"}
          </button>
        </div>

        {/* SCORE LEGEND */}
        <div style={{ display: "flex", gap: "8px", padding: "5px 16px", flexWrap: "wrap", borderBottom: `1px solid ${borderColor}`, flexShrink: 0 }}>
          {[
            { color: "#22c55e", label: "Safe 80-100" },
            { color: "#3b82f6", label: "Good 60-79" },
            { color: "#f59e0b", label: "Moderate 40-59" },
            { color: "#ef4444", label: "Risk 0-39" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: isNight ? "#94a3b8" : "#64748b" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: item.color }} />
              {item.label}
            </div>
          ))}
        </div>

        {/* ROUTES LIST */}
        <div style={{ overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {routes.map((route, index) => {
            const colors = getScoreColor(route.safetyScore);
            const cardBg = isNight ? "#1e293b" : timeZone === "evening" ? "#1e293b" : colors.bg;
            return (
              <div key={index} style={{ backgroundColor: cardBg, border: `2px solid ${colors.border}`, borderRadius: "16px", padding: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>⭐</span>
                    <span style={{ fontWeight: 700, fontSize: "15px", color: isNight ? "#f1f5f9" : timeZone === "evening" ? "#f1f5f9" : "#1e293b" }}>
                      Route {route.id}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {["📍 " + route.distance + " km", "⏱ " + route.time + " min"].map((t, i) => (
                      <span key={i} style={{
                        fontSize: "12px",
                        color: isNight || timeZone === "evening" ? "#94a3b8" : "#64748b",
                        background: isNight || timeZone === "evening" ? "#0f172a" : "white",
                        padding: "2px 8px", borderRadius: "999px",
                        border: `1px solid ${isNight || timeZone === "evening" ? "#334155" : "#e2e8f0"}`,
                      }}>{t}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: colors.badge, color: "white", fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px" }}>
                    🛡️ Safety Score: {route.safetyScore}/100
                  </div>
                  {timeZone === "night" && route.safetyScore < 50 && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#1e1b4b", color: "#a5b4fc", fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px" }}>
                      🌙 High Night Risk
                    </div>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "12px" }}>
                  {[
                    { icon: "🚓", label: "Police",     value: route.police,    clickable: false },
                    { icon: "💡", label: "Lighting",   value: route.lighting,  clickable: true  },
                    { icon: "👥", label: "Crowd",      value: route.crowd,     clickable: true  },
                    { icon: "⚠️", label: "Risk Zones", value: route.riskZones, clickable: false },
                    { icon: "🏨", label: "Hotels",     value: route.hotels,    clickable: false },
                    { icon: "🏥", label: "Hospitals",  value: route.hospitals, clickable: false },
                  ].map((item, i) => (
                    <div key={i}
                      onClick={item.clickable ? (e) => handleInfoClick(e, item.label, item.value) : undefined}
                      style={{
                        display: "flex", alignItems: "center", gap: "5px",
                        backgroundColor: isNight || timeZone === "evening" ? "#0f172a" : "white",
                        borderRadius: "8px", padding: "5px 8px", fontSize: "12px",
                        border: `1px solid ${item.clickable ? "#3b82f6" : (isNight || timeZone === "evening" ? "#334155" : "#f1f5f9")}`,
                        cursor: item.clickable ? "pointer" : "default",
                      }}>
                      <span style={{ fontSize: "13px" }}>{item.icon}</span>
                      <span style={{ color: isNight || timeZone === "evening" ? "#64748b" : "#94a3b8", fontSize: "11px" }}>{item.label}:</span>
                      <span style={{ fontWeight: 600, color: isNight || timeZone === "evening" ? "#e2e8f0" : "#374151" }}>{item.value}</span>
                      {item.clickable && <span style={{ marginLeft: "auto", fontSize: "10px", color: "#3b82f6" }}>ℹ️</span>}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => startNavigation(route.coords)}
                  style={{ width: "100%", backgroundColor: "#2563eb", color: "white", border: "none", borderRadius: "12px", padding: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1d4ed8"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "#2563eb"}
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