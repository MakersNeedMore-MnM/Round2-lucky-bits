import React, { useState, useEffect } from "react";
import { Bell, ShieldCheck, Activity, Terminal } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

export function Header({ onAuditClick }) {
  const [activeAlerts, setActiveAlerts] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await api.getAlertCount();
        setActiveAlerts(data.active || 0);
      } catch (e) {}
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      height: "65px",
      backgroundColor: "#0a1122",
      borderBottom: "1px solid var(--border-color)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 2rem",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          AI-Driven Multi-Vendor Network Security Compliance Auditor
        </h1>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          background: "rgba(16, 185, 129, 0.15)",
          color: "#34d399",
          padding: "0.2rem 0.55rem",
          borderRadius: "9999px",
          fontSize: "0.725rem",
          fontWeight: 600
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
          Online • 24 Nodes
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Quick Audit Button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onAuditClick}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <Activity size={14} style={{ color: "var(--accent-cyan)" }} />
          <span>Audit Now</span>
        </button>

        {/* Alerts Icon Link */}
        <Link
          to="/alerts"
          style={{
            position: "relative",
            background: "#121c33",
            border: "1px solid var(--border-color)",
            padding: "0.5rem",
            borderRadius: "8px",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            textDecoration: "none"
          }}
          title="Active Security Alerts"
        >
          <Bell size={18} />
          {activeAlerts > 0 && (
            <span style={{
              position: "absolute",
              top: -5,
              right: -5,
              background: "#ef4444",
              color: "#fff",
              fontSize: "0.65rem",
              fontWeight: 700,
              width: 18,
              height: 18,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #0a1122"
            }}>
              {activeAlerts}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
