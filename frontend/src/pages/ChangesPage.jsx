import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { History, Zap, Filter, Search, ShieldAlert, CheckCircle, AlertTriangle, ArrowRight, Eye } from "lucide-react";
import { api } from "../services/api.js";
import { RiskBadge } from "../components/RiskBadge.jsx";

export function ChangesPage() {
  const { refreshKey, triggerRefresh } = useOutletContext();
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [simulating, setSimulating] = useState(false);

  const fetchChanges = async () => {
    try {
      setLoading(true);
      const data = await api.getChanges(filter === "all" ? "" : filter, search);
      setChanges(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChanges();
  }, [filter, search, refreshKey]);

  const handleSimulate = async () => {
    try {
      setSimulating(true);
      await api.simulateChange();
      await fetchChanges();
      triggerRefresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setSimulating(false);
    }
  };

  const filterTabs = [
    { id: "all", label: "All Changes" },
    { id: "unauthorized", label: "Unauthorized" },
    { id: "authorized", label: "Authorized" },
    { id: "high_risk", label: "High Risk" },
    { id: "critical", label: "Critical" }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
            Configuration Drift & Change Detection
          </h2>
          <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Audit trail of unauthorized parameter modifications, security policy alterations and drifts
          </p>
        </div>
        <div>
          <button
            className="btn btn-primary"
            onClick={handleSimulate}
            disabled={simulating}
            style={{
              background: "linear-gradient(135deg, #ea580c, #c2410c)",
              boxShadow: "0 0 15px rgba(234, 88, 12, 0.4)"
            }}
          >
            <Zap size={16} />
            {simulating ? "Detecting Drift..." : "Simulate Configuration Change"}
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="cyber-card" style={{ marginBottom: "1.25rem", padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                className={`btn btn-sm ${filter === tab.id ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", width: "280px" }}>
            <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: "2.2rem", padding: "0.4rem 2.2rem" }}
              placeholder="Search changes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Changes List */}
      <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="cyber-table-container" style={{ border: "none" }}>
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Changed Setting</th>
                <th>Drift Delta</th>
                <th>Change Type</th>
                <th>Risk Level</th>
                <th>Time Detected</th>
                <th>Reason & Recommendation</th>
                <th style={{ textAlign: "right" }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                    Loading change telemetry...
                  </td>
                </tr>
              ) : changes.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                    No configuration changes match the selected filter.
                  </td>
                </tr>
              ) : (
                changes.map((change) => (
                  <tr key={change.id}>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/devices/${change.device_id}`} style={{ color: "#fff", textDecoration: "none" }}>
                        {change.device_name}
                      </Link>
                    </td>
                    <td style={{ fontWeight: 500, color: "var(--accent-cyan)" }}>
                      {change.setting_name}
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.775rem" }}>
                      <span style={{ color: "var(--text-muted)" }}>{change.previous_value}</span>
                      <span style={{ margin: "0 0.35rem", color: "#64748b" }}>→</span>
                      <span style={{ color: "#f87171", fontWeight: 700 }}>{change.current_value}</span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: "0.725rem",
                        fontWeight: 600,
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        background: change.is_authorized ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: change.is_authorized ? "#34d399" : "#f87171"
                      }}>
                        {change.change_type}
                      </span>
                    </td>
                    <td>
                      <RiskBadge level={change.risk_level} />
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {change.detected_at ? new Date(change.detected_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                    </td>
                    <td style={{ fontSize: "0.775rem", maxWidth: "340px" }}>
                      <div style={{ color: "#e2e8f0", marginBottom: "0.2rem" }}>
                        {change.reason}
                      </div>
                      <div style={{ color: "var(--accent-cyan)", fontSize: "0.725rem" }}>
                        💡 {change.recommendation}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        to={`/configuration?device=${change.device_id}`}
                        className="btn btn-secondary btn-sm"
                        title="View Detailed Diff"
                      >
                        <Eye size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
