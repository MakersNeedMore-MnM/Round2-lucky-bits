import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Bell, ShieldAlert, CheckCircle2, AlertOctagon, AlertTriangle, Eye, Check, CheckCheck } from "lucide-react";
import { api } from "../services/api.js";
import { RiskBadge } from "../components/RiskBadge.jsx";

export function AlertsPage() {
  const { refreshKey, triggerRefresh } = useOutletContext();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Active");
  const [severityFilter, setSeverityFilter] = useState("All");

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getAlerts(
        statusFilter === "All" ? "" : statusFilter,
        severityFilter === "All" ? "" : severityFilter
      );
      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, severityFilter, refreshKey]);

  const handleAcknowledge = async (id) => {
    try {
      await api.acknowledgeAlert(id);
      await fetchAlerts();
      triggerRefresh();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.resolveAlert(id);
      await fetchAlerts();
      triggerRefresh();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
            Real-Time Security Alerts Center
          </h2>
          <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Incident queue for unauthorized configuration drifts and critical posture violations
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="cyber-card" style={{ marginBottom: "1.25rem", padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          {/* Status Filter Tabs */}
          <div style={{ display: "flex", gap: "0.4rem" }}>
            {["Active", "Acknowledged", "Resolved", "All"].map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Severity:</span>
            <select
              className="input-field"
              style={{ width: "auto", padding: "0.4rem 0.75rem", fontSize: "0.8rem" }}
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Only</option>
              <option value="Medium">Medium Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p style={{ color: "var(--text-secondary)" }}>Polling security alert stream...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="cyber-card" style={{ textAlign: "center", padding: "3.5rem" }}>
          <CheckCircle2 size={36} style={{ color: "var(--risk-low)", margin: "0 auto 0.75rem" }} />
          <h3 style={{ color: "#fff", marginBottom: "0.3rem" }}>No Alerts in this Queue</h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Try simulating a configuration change to watch real-time alert dispatch.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {alerts.map((alert) => {
            const isResolved = alert.status === "Resolved";
            const isAck = alert.status === "Acknowledged";

            return (
              <div
                key={alert.id}
                className="cyber-card"
                style={{
                  background: isResolved ? "#080c14" : "#0d172a",
                  opacity: isResolved ? 0.7 : 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "1rem"
                }}
              >
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                  <div style={{ paddingTop: "0.2rem" }}>
                    <RiskBadge level={alert.severity} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
                        {alert.title}
                      </h4>
                      <span style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        padding: "0.15rem 0.5rem",
                        borderRadius: "9999px",
                        background: isResolved ? "rgba(16, 185, 129, 0.2)" : isAck ? "rgba(245, 158, 11, 0.2)" : "rgba(239, 68, 68, 0.2)",
                        color: isResolved ? "#34d399" : isAck ? "#fbbf24" : "#f87171"
                      }}>
                        {alert.status}
                      </span>
                    </div>

                    <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.35rem", maxWidth: "850px" }}>
                      {alert.message}
                    </p>

                    <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                      <span>Device: <strong>{alert.device_name}</strong></span>
                      {alert.ip_address && <span>IP: <strong style={{ color: "#38bdf8" }}>{alert.ip_address}</strong></span>}
                      <span>Logged: <strong>{new Date(alert.created_at).toLocaleString()}</strong></span>
                      {alert.resolved_at && <span>Resolved: <strong>{new Date(alert.resolved_at).toLocaleString()}</strong></span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {alert.device_id && (
                    <Link
                      to={`/devices/${alert.device_id}`}
                      className="btn btn-secondary btn-sm"
                      title="Inspect Device"
                    >
                      <Eye size={13} /> View Device
                    </Link>
                  )}

                  {!isResolved && !isAck && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAcknowledge(alert.id)}
                      title="Acknowledge Alert"
                    >
                      <Check size={13} /> Acknowledge
                    </button>
                  )}

                  {!isResolved && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleResolve(alert.id)}
                      title="Mark Resolved"
                    >
                      <CheckCheck size={13} /> Resolve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
