"use client";
import { useState, useEffect } from "react";

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getNextTurnInstruction = (position, route) => {
  if (!position || !route?.length) return null;
  let minDist = Infinity, closestIdx = 0;
  route.forEach(([lat, lng], i) => {
    const d = getDistance(position[0], position[1], lat, lng);
    if (d < minDist) { minDist = d; closestIdx = i; }
  });
  // Look ahead ~5 points for a direction change
  const lookAhead = Math.min(closestIdx + 5, route.length - 1);
  if (lookAhead <= closestIdx) return null;
  const [lat1, lng1] = route[closestIdx];
  const [lat2, lng2] = route[lookAhead];
  const bearing = Math.atan2(lng2 - lng1, lat2 - lat1) * 180 / Math.PI;
  const distToTurn = getDistance(position[0], position[1], lat2, lng2);
  const distText = distToTurn < 1000
    ? `${Math.round(distToTurn)} m`
    : `${(distToTurn / 1000).toFixed(1)} km`;
  if (bearing > 45 && bearing < 135) return { dir: "Turn right", dist: distText, arrow: "→" };
  if (bearing < -45 && bearing > -135) return { dir: "Turn left", dist: distText, arrow: "←" };
  return { dir: "Continue straight", dist: distText, arrow: "↑" };
};

export default function NavigationHUD({
  position, selectedRoute, estimatedTime,
  onEndNav, onReport,
  // New props passed from page.js for the side panel
  safetyScore, lighting, crowd, police, hospitals, riskZones,
}) {
  const [remaining, setRemaining] = useState({ dist: 0, time: 0 });
  const [hasCommunityWarning, setHasCommunityWarning] = useState(false);
  const [nextTurn, setNextTurn] = useState(null);
  const [eta, setEta] = useState("");

  useEffect(() => {
    if (!position || !selectedRoute?.length) return;

    // Find closest point on route
    let minDist = Infinity, closestIdx = 0;
    selectedRoute.forEach(([lat, lng], i) => {
      const d = getDistance(position[0], position[1], lat, lng);
      if (d < minDist) { minDist = d; closestIdx = i; }
    });

    // Remaining distance from closest point
    let remDist = 0;
    for (let i = closestIdx; i < selectedRoute.length - 1; i++) {
      remDist += getDistance(
        selectedRoute[i][0], selectedRoute[i][1],
        selectedRoute[i + 1][0], selectedRoute[i + 1][1]
      );
    }

    const remKm = (remDist / 1000).toFixed(1);
    const remMin = Math.round((remDist / 1000) / 30 * 60);
    setRemaining({ dist: remKm, time: remMin });

    // ETA
    const now = new Date();
    now.setMinutes(now.getMinutes() + remMin);
    setEta(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

    // Turn instruction
    setNextTurn(getNextTurnInstruction(position, selectedRoute));

    // Community reports
    const checkReports = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/reports/nearby?lat=${position[0]}&lon=${position[1]}&radius=300`);
        const data = await res.json();
        setHasCommunityWarning(data.reports?.length > 0);
      } catch {}
    };
    checkReports();
  }, [position, selectedRoute]);

  const scoreColor = (s) => {
    if (!s) return "#94a3b8";
    if (s >= 80) return "#16a34a";
    if (s >= 60) return "#2563eb";
    if (s >= 40) return "#d97706";
    return "#dc2626";
  };

  return (
    /*
     * SPLIT-SCREEN LAYOUT
     * The map (MapView) is rendered behind this HUD in page.js.
     * We render a RIGHT PANEL only — transparent on the left so the map shows through.
     * The map itself is constrained to left: 0, right: 320px in navigationMode via MapView.
     */
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 500,
      display: "flex",
      pointerEvents: "none",
    }}>

      {/* LEFT: transparent — map shows through, but recenter button lives here */}
      <div style={{ flex: 1, position: "relative", pointerEvents: "none" }}>
        {/* Recenter is rendered inside MapView, so nothing needed here */}
      </div>

      {/* RIGHT PANEL — navigation info */}
      <div style={{
        width: "320px",
        minWidth: "280px",
        maxWidth: "340px",
        backgroundColor: "#0f172a",
        display: "flex",
        flexDirection: "column",
        pointerEvents: "auto",
        overflow: "hidden",
      }}>

        {/* ── NEXT TURN ── */}
        <div style={{
          backgroundColor: "#1e40af",
          padding: "16px 16px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          {nextTurn ? (
            <>
              <div style={{ color: "#93c5fd", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", marginBottom: "4px" }}>
                NEXT TURN
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", color: "white",
                }}>
                  {nextTurn.arrow}
                </div>
                <div>
                  <div style={{ color: "white", fontSize: "16px", fontWeight: 700 }}>{nextTurn.dir}</div>
                  <div style={{ color: "#93c5fd", fontSize: "12px", marginTop: "2px" }}>In {nextTurn.dist}</div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: "white", fontSize: "16px", fontWeight: 700 }}>
              ↑ Continue on route
            </div>
          )}
        </div>

        {/* ── STATS ── */}
        <div style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "8px",
        }}>
          {[
            { label: "ETA", value: eta || "--" },
            { label: "Remaining", value: `${remaining.dist} km` },
            { label: "Time left", value: `${remaining.time} min` },
          ].map((item) => (
            <div key={item.label} style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              borderRadius: "10px",
              padding: "8px 6px",
              textAlign: "center",
            }}>
              <div style={{ color: "#64748b", fontSize: "9px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{item.label}</div>
              <div style={{ color: "white", fontSize: "13px", fontWeight: 700, marginTop: "2px" }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* ── SAFETY SCORE ── */}
        <div style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em" }}>SAFETY SCORE</span>
            <span style={{ color: scoreColor(safetyScore), fontSize: "16px", fontWeight: 700 }}>
              {safetyScore ?? "--"}/100
            </span>
          </div>
          <div style={{ height: "6px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${safetyScore ?? 0}%`,
              backgroundColor: scoreColor(safetyScore),
              borderRadius: "999px",
              transition: "width 0.5s ease",
            }} />
          </div>

          {/* Safety tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
            {lighting && (
              <span style={tagStyle(lighting === "Low Lighting" ? "warn" : "ok")}>
                💡 {lighting}
              </span>
            )}
            {crowd && (
              <span style={tagStyle(crowd === "High" ? "warn" : "ok")}>
                👥 {crowd}
              </span>
            )}
            {police !== undefined && (
              <span style={tagStyle("neutral")}>🚓 Police: {police}</span>
            )}
            {hospitals !== undefined && (
              <span style={tagStyle("neutral")}>🏥 Hosp: {hospitals}</span>
            )}
            {riskZones !== undefined && (
              <span style={tagStyle(riskZones > 2 ? "danger" : "neutral")}>⚠️ Zones: {riskZones}</span>
            )}
          </div>
        </div>

        {/* ── COMMUNITY WARNING ── */}
        {hasCommunityWarning && (
          <div style={{
            margin: "10px 16px 0",
            backgroundColor: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            padding: "8px 12px",
            fontSize: "11px",
            color: "#fca5a5",
            fontWeight: 600,
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            ⚠️ Community-reported safety concerns nearby
          </div>
        )}

        {/* SPACER */}
        <div style={{ flex: 1 }} />

        {/* ── ACTIONS ── */}
        <div style={{
          padding: "14px 16px 20px",
          display: "flex",
          gap: "10px",
        }}>
          <button
            onClick={onReport}
            style={{
              flex: 1, padding: "12px 8px",
              backgroundColor: "rgba(245,158,11,0.15)",
              color: "#fbbf24",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "12px",
              fontSize: "13px", fontWeight: 700, cursor: "pointer",
            }}
          >
            ⚠️ Report
          </button>
          <button
            onClick={onEndNav}
            style={{
              flex: 1, padding: "12px 8px",
              backgroundColor: "rgba(239,68,68,0.15)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "12px",
              fontSize: "13px", fontWeight: 700, cursor: "pointer",
            }}
          >
            ✕ End
          </button>
        </div>

      </div>
    </div>
  );
}

const tagStyle = (type) => {
  const map = {
    ok:      { bg: "rgba(34,197,94,0.12)",  color: "#86efac", border: "rgba(34,197,94,0.25)" },
    warn:    { bg: "rgba(245,158,11,0.12)", color: "#fcd34d", border: "rgba(245,158,11,0.25)" },
    danger:  { bg: "rgba(239,68,68,0.12)",  color: "#fca5a5", border: "rgba(239,68,68,0.25)" },
    neutral: { bg: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "rgba(255,255,255,0.1)" },
  };
  const t = map[type] || map.neutral;
  return {
    display: "inline-flex", alignItems: "center", gap: "3px",
    backgroundColor: t.bg, color: t.color,
    border: `1px solid ${t.border}`,
    borderRadius: "20px", padding: "3px 8px",
    fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap",
  };
};