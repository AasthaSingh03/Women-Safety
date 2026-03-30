"use client";
import { useState } from "react";

const ISSUES = [
  { id: "poor_lighting",      label: "Poor Lighting",        icon: "💡" },
  { id: "unsafe_area",        label: "Unsafe Area",          icon: "🚨" },
  { id: "suspicious_activity",label: "Suspicious Activity",  icon: "👁️" },
  { id: "harassment_risk",    label: "Harassment Risk",      icon: "⚠️" },
  { id: "isolated_area",      label: "Isolated Area",        icon: "🏚️" },
  { id: "no_police",          label: "No Police Presence",   icon: "🚓" },
  { id: "other",              label: "Other",                icon: "📝" },
];

export default function ReportModal({ position, routeId, onClose, onSubmit }) {
  const [selected, setSelected] = useState([]);
  const [severity, setSeverity] = useState("Medium");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggle = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const handleSubmit = async () => {
    if (!selected.length) { alert("Select at least one issue"); return; }
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: position[0], lon: position[1],
          issues: selected, severity, routeId, note,
        }),
      });
      setSubmitted(true);
      setTimeout(onClose, 1500);
      if (onSubmit) onSubmit();
    } catch (err) {
      console.error("Report error:", err);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        width: "100%", maxWidth: "480px",
        backgroundColor: "#ffffff",
        borderRadius: "20px 20px 0 0",
        padding: "20px", paddingBottom: "32px",
      }} onClick={e => e.stopPropagation()}>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: "48px" }}>✅</div>
            <p style={{ fontWeight: 700, fontSize: "16px", marginTop: "8px" }}>Report Submitted!</p>
            <p style={{ color: "#64748b", fontSize: "13px" }}>Thank you for helping keep others safe.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontWeight: 700, fontSize: "16px", margin: 0 }}>⚠️ Report Safety Issue</h3>
              <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            {/* Issue selection */}
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>Select issue(s):</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px" }}>
              {ISSUES.map(issue => (
                <button key={issue.id} onClick={() => toggle(issue.id)} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 10px", borderRadius: "10px", fontSize: "12px",
                  border: `2px solid ${selected.includes(issue.id) ? "#ef4444" : "#e2e8f0"}`,
                  backgroundColor: selected.includes(issue.id) ? "#fef2f2" : "white",
                  cursor: "pointer", fontWeight: selected.includes(issue.id) ? 600 : 400,
                }}>
                  <span>{issue.icon}</span>{issue.label}
                </button>
              ))}
            </div>

            {/* Severity */}
            <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>Severity:</p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {["Low", "Medium", "High"].map(s => (
                <button key={s} onClick={() => setSeverity(s)} style={{
                  flex: 1, padding: "6px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
                  border: `2px solid ${severity === s ? (s === "High" ? "#ef4444" : s === "Medium" ? "#f59e0b" : "#22c55e") : "#e2e8f0"}`,
                  backgroundColor: severity === s ? (s === "High" ? "#fef2f2" : s === "Medium" ? "#fffbeb" : "#f0fdf4") : "white",
                  cursor: "pointer",
                  color: severity === s ? (s === "High" ? "#dc2626" : s === "Medium" ? "#d97706" : "#16a34a") : "#64748b",
                }}>{s}</button>
              ))}
            </div>

            {/* Note */}
            <textarea
              placeholder="Additional details (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              style={{
                width: "100%", padding: "8px 10px", borderRadius: "8px",
                border: "1px solid #e2e8f0", fontSize: "12px",
                resize: "none", height: "60px", marginBottom: "16px",
                boxSizing: "border-box",
              }}
            />

            <button onClick={handleSubmit} style={{
              width: "100%", backgroundColor: "#ef4444", color: "white",
              border: "none", borderRadius: "12px", padding: "12px",
              fontSize: "14px", fontWeight: 700, cursor: "pointer",
            }}>
              Submit Report
            </button>
          </>
        )}
      </div>
    </div>
  );
}