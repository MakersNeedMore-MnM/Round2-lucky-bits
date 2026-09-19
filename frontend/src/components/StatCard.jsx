import React from "react";

export function StatCard({ title, value, icon: Icon, color = "#0284c7", subtitle, badgeText, badgeType = "primary" }) {
  return (
    <div className="cyber-card" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "4px",
        height: "100%",
        backgroundColor: color
      }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {title}
          </span>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "0.25rem", fontFamily: "var(--font-mono)" }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
              {subtitle}
            </div>
          )}
        </div>
        <div style={{
          background: `${color}20`,
          color: color,
          padding: "0.75rem",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Icon size={24} />
        </div>
      </div>
      {badgeText && (
        <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Status:</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: color }}>{badgeText}</span>
        </div>
      )}
    </div>
  );
}
