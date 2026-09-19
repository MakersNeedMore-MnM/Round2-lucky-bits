import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, FileCode, Sliders } from "lucide-react";

export function ConfigDiffViewer({ previousConfig = {}, currentConfig = {}, previousRaw = "", currentRaw = "", diffs = [] }) {
  const [viewMode, setViewMode] = useState("structured"); // "structured" | "raw"

  const attributes = [
    { key: "logging", label: "Centralized Audit Logging", ideal: "Enabled" },
    { key: "remote_access", label: "Insecure Remote Access (Telnet/HTTP)", ideal: "Disabled" },
    { key: "password_policy", label: "Password Complexity & Encryption", ideal: "Strong" },
    { key: "default_deny", label: "Perimeter Inbound Default Deny", ideal: true },
    { key: "snmp_version", label: "SNMP Protocol Security Level", ideal: "v3" },
    { key: "http_web_access", label: "Unencrypted HTTP Web Access", ideal: false },
    { key: "ntp_configured", label: "NTP Clocks Synchronized", ideal: true },
    { key: "session_timeout", label: "Admin Idle Session Timeout", ideal: 10 }
  ];

  const getRowStatus = (attr) => {
    const prevVal = previousConfig[attr.key];
    const currVal = currentConfig[attr.key];
    const hasChanged = prevVal !== undefined && currVal !== undefined && prevVal !== currVal;

    // Check if risky
    if (
      (attr.key === "logging" && currVal === "Disabled") ||
      (attr.key === "remote_access" && currVal === "Enabled") ||
      (attr.key === "password_policy" && currVal === "Weak") ||
      (attr.key === "default_deny" && !currVal)
    ) {
      return {
        level: "danger",
        cls: "diff-danger",
        icon: AlertCircle,
        label: hasChanged ? "RISKY CHANGE DETECTED" : "CRITICAL RISK",
        hasChanged
      };
    }

    // Check if warning
    if (
      (attr.key === "snmp_version" && currVal !== "v3") ||
      (attr.key === "http_web_access" && currVal) ||
      (attr.key === "password_policy" && currVal === "Moderate") ||
      (attr.key === "ntp_configured" && !currVal)
    ) {
      return {
        level: "warning",
        cls: "diff-warning",
        icon: AlertTriangle,
        label: hasChanged ? "WARNING CHANGE" : "POLICY DEVIATION",
        hasChanged
      };
    }

    return {
      level: "safe",
      cls: "diff-safe",
      icon: CheckCircle2,
      label: "UNCHANGED / SAFE",
      hasChanged
    };
  };

  const formatVal = (val) => {
    if (val === true) return "Enabled";
    if (val === false) return "Disabled";
    if (val === null || val === undefined) return "Not Configured";
    return String(val);
  };

  return (
    <div className="cyber-card" style={{ marginTop: "1rem" }}>
      <div className="card-header" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.75rem" }}>
        <div>
          <div className="card-title">
            <Sliders size={18} style={{ color: "var(--accent-cyan)" }} />
            Configuration Drift & Differential Analyzer
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Visual comparison of active running parameters against baseline snapshot.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className={`btn btn-sm ${viewMode === "structured" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setViewMode("structured")}
          >
            <Sliders size={14} /> Structured Parameters
          </button>
          <button
            className={`btn btn-sm ${viewMode === "raw" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setViewMode("raw")}
          >
            <FileCode size={14} /> Raw CLI Diff
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "1.5rem", padding: "0.75rem 0", fontSize: "0.75rem", borderBottom: "1px solid var(--border-color)", marginBottom: "1rem" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--risk-low)" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--risk-low)" }} />
          GREEN = Unchanged / Safe Baseline
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--risk-medium)" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--risk-medium)" }} />
          YELLOW = Warning / Audit Warning
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "var(--risk-critical)" }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--risk-critical)" }} />
          RED = Risky Unauthorized Change / Vulnerability
        </span>
      </div>

      {viewMode === "structured" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "2.5fr 2fr 2fr 2fr",
            padding: "0.5rem 0.75rem",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            fontWeight: 600
          }}>
            <span>Parameter / Setting</span>
            <span>Previous Configuration</span>
            <span>Current Configuration</span>
            <span>Compliance Assessment</span>
          </div>

          {attributes.map((attr) => {
            const status = getRowStatus(attr);
            const Icon = status.icon;
            const prev = formatVal(previousConfig[attr.key]);
            const curr = formatVal(currentConfig[attr.key]);

            return (
              <div key={attr.key} className={`diff-row ${status.cls}`} style={{ display: "grid", gridTemplateColumns: "2.5fr 2fr 2fr 2fr", alignItems: "center" }}>
                <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Icon size={16} />
                  {attr.label}
                </span>
                <span style={{ color: "var(--text-secondary)" }}>
                  {prev}
                </span>
                <span style={{
                  fontWeight: status.hasChanged ? 700 : 500,
                  textDecoration: status.hasChanged ? "underline" : "none"
                }}>
                  {curr}
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
              Previous Running Configuration (Baseline v1)
            </div>
            <pre style={{
              background: "#090f1d",
              border: "1px solid var(--border-color)",
              padding: "1rem",
              borderRadius: "8px",
              fontSize: "0.775rem",
              color: "#94a3b8",
              maxHeight: "450px",
              overflowY: "auto",
              whiteSpace: "pre-wrap"
            }}>
              {previousRaw || "# Baseline configuration snapshot unavailable"}
            </pre>
          </div>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-cyan)", marginBottom: "0.5rem" }}>
              Current Running Configuration (Active)
            </div>
            <pre style={{
              background: "#090f1d",
              border: "1px solid rgba(6, 182, 212, 0.3)",
              padding: "1rem",
              borderRadius: "8px",
              fontSize: "0.775rem",
              color: "#38bdf8",
              maxHeight: "450px",
              overflowY: "auto",
              whiteSpace: "pre-wrap"
            }}>
              {currentRaw || "# Active running configuration unavailable"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
