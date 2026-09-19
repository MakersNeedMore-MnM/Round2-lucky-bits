import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Server,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  AlertOctagon,
  CheckSquare,
  History,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  Bell
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { api } from "../services/api.js";
import { StatCard } from "../components/StatCard.jsx";
import { VendorBadge } from "../components/VendorBadge.jsx";
import { RiskBadge } from "../components/RiskBadge.jsx";

export function DashboardPage() {
  const { refreshKey, triggerRefresh } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  const handleResolveAlert = async (id) => {
    try {
      await api.resolveAlert(id);
      fetchDashboardData();
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcknowledgeAlert = async (id) => {
    try {
      await api.acknowledgeAlert(id);
      fetchDashboardData();
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <Activity size={32} className="animate-spin" style={{ color: "var(--accent-cyan)", margin: "0 auto 1rem" }} />
        <p style={{ color: "var(--text-secondary)" }}>Loading central security telemetry...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="cyber-card" style={{ textAlign: "center", padding: "3rem", borderColor: "rgba(239, 68, 68, 0.4)" }}>
        <AlertTriangle size={36} style={{ color: "var(--risk-critical)", margin: "0 auto 1rem" }} />
        <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Unable to load dashboard data</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>{error}</p>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Retry Connection
        </button>
      </div>
    );
  }

  const { summary, charts, recentChanges, recentAlerts } = data;

  const RISK_COLORS = {
    Low: "#10b981",
    Medium: "#f59e0b",
    High: "#f97316",
    Critical: "#ef4444"
  };

  return (
    <div>
      {/* Top Welcome & Subtitle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff" }}>
            Network Security Operations Center
          </h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
            Continuous multi-vendor posture analysis, configuration drift monitoring & AI risk evaluation
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>Overall Compliance:</span>
          <span style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            color: summary.overall_compliance >= 85 ? "#34d399" : "#fbbf24",
            fontFamily: "var(--font-mono)"
          }}>
            {summary.overall_compliance}%
          </span>
        </div>
      </div>

      {/* 5 Summary KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <StatCard
          title="Total Devices"
          value={summary.total_devices}
          icon={Server}
          color="#38bdf8"
          subtitle="Cisco, Fortinet, Palo Alto, Juniper"
          badgeText="Active Monitoring"
        />
        <StatCard
          title="Safe Devices"
          value={summary.safe_devices}
          icon={ShieldCheck}
          color="#10b981"
          subtitle="In full compliance"
          badgeText="Low Risk"
        />
        <StatCard
          title="Warning Devices"
          value={summary.warning_devices}
          icon={AlertTriangle}
          color="#f59e0b"
          subtitle="Minor policy deviations"
          badgeText="Review Required"
        />
        <StatCard
          title="High Risk Devices"
          value={summary.high_risk_devices}
          icon={ShieldAlert}
          color="#f97316"
          subtitle="Vulnerabilities detected"
          badgeText="Action Needed"
        />
        <StatCard
          title="Critical Issues"
          value={summary.critical_issues}
          icon={AlertOctagon}
          color="#ef4444"
          subtitle="Immediate threat surface"
          badgeText="Urgent Patch"
        />
      </div>

      {/* 4 Central Visual Charts */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
        gap: "1.25rem",
        marginBottom: "1.5rem"
      }}>
        {/* Chart 1: Risk Distribution */}
        <div className="cyber-card">
          <div className="card-header">
            <span className="card-title">
              <ShieldAlert size={18} style={{ color: "var(--accent-cyan)" }} />
              Risk Distribution Across Fleet
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>24 Nodes</span>
          </div>
          <div style={{ height: "240px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {charts.riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#fff" }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap", fontSize: "0.75rem" }}>
            {charts.riskDistribution.map((item) => (
              <span key={item.name} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <span style={{ width: 9, height: 9, borderRadius: "50%", background: RISK_COLORS[item.name] || item.color }} />
                {item.name}: <strong>{item.value}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Chart 2: Vendor Distribution */}
        <div className="cyber-card">
          <div className="card-header">
            <span className="card-title">
              <Layers size={18} style={{ color: "var(--accent-cyan)" }} />
              Multi-Vendor Fleet Distribution
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>4 Heterogeneous Vendors</span>
          </div>
          <div style={{ height: "240px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.vendorDistribution} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="vendor" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#fff" }}
                  cursor={{ fill: "rgba(255,255,255,0.03)" }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]}>
                  {charts.vendorDistribution.map((entry, idx) => {
                    const colors = ["#049fd9", "#ee3124", "#fa582d", "#6da234"];
                    return <Cell key={`bar-${idx}`} fill={colors[idx % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Standardized policy evaluation across Cisco IOS, FortiOS, PAN-OS & JunOS
          </div>
        </div>

        {/* Chart 3: Configuration Changes Over Time */}
        <div className="cyber-card">
          <div className="card-header">
            <span className="card-title">
              <History size={18} style={{ color: "var(--accent-cyan)" }} />
              Configuration Drift Velocity
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Today</span>
          </div>
          <div style={{ height: "240px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.changesTimeline} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="changeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#fff" }} />
                <Area type="monotone" dataKey="changes" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#changeGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Hourly configuration parameter alterations tracked across fleet
          </div>
        </div>

        {/* Chart 4: Compliance Score by Framework Category */}
        <div className="cyber-card">
          <div className="card-header">
            <span className="card-title">
              <CheckSquare size={18} style={{ color: "var(--accent-cyan)" }} />
              Compliance Score by Domain
            </span>
            <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 700 }}>
              Overall: {summary.overall_compliance}%
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginTop: "0.5rem" }}>
            {charts.complianceBreakdown.map((item) => (
              <div key={item.category}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{item.category}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: item.score >= 85 ? "#34d399" : "#fbbf24" }}>
                    {item.score}%
                  </span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "#1e293b", borderRadius: "9999px", overflow: "hidden" }}>
                  <div style={{
                    width: `${item.score}%`,
                    height: "100%",
                    background: item.score >= 85 ? "linear-gradient(90deg, #10b981, #06b6d4)" : "linear-gradient(90deg, #f59e0b, #ef4444)",
                    borderRadius: "9999px"
                  }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)", textAlign: "center" }}>
            <Link to="/compliance" style={{ fontSize: "0.775rem", color: "var(--accent-cyan)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              View all 8 CIS Benchmark Rules <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Bottom Grid: Recent Changes & Active Alerts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: "1.25rem" }}>
        {/* Recent Changes */}
        <div className="cyber-card">
          <div className="card-header">
            <span className="card-title">
              <History size={18} style={{ color: "var(--accent-cyan)" }} />
              Recent Configuration Drift
            </span>
            <Link to="/changes" style={{ fontSize: "0.775rem", color: "var(--accent-cyan)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="cyber-table-container">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Setting Changed</th>
                  <th>Drift Delta</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {recentChanges.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: "1.5rem" }}>
                      No recent unauthorized changes logged.
                    </td>
                  </tr>
                ) : (
                  recentChanges.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.device_name}</td>
                      <td>{c.setting_name}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.775rem" }}>
                        <span style={{ color: "#94a3b8" }}>{c.previous_value}</span>
                        <span style={{ color: "#64748b", margin: "0 0.35rem" }}>→</span>
                        <span style={{ color: "#f87171", fontWeight: 600 }}>{c.current_value}</span>
                      </td>
                      <td>
                        <RiskBadge level={c.risk_level} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Alerts Center */}
        <div className="cyber-card">
          <div className="card-header">
            <span className="card-title">
              <Bell size={18} style={{ color: "var(--accent-cyan)" }} />
              Active Security Alerts
            </span>
            <Link to="/alerts" style={{ fontSize: "0.775rem", color: "var(--accent-cyan)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              Manage alerts ({recentAlerts.length}) <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {recentAlerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                <ShieldCheck size={28} style={{ color: "var(--risk-low)", margin: "0 auto 0.5rem" }} />
                No active critical or high-risk alerts.
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    background: "#0a1324",
                    borderLeft: `4px solid ${RISK_COLORS[alert.severity] || "#f59e0b"}`,
                    borderRadius: "6px",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "0.75rem"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.2rem" }}>
                      <RiskBadge level={alert.severity} />
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#fff" }}>
                        {alert.device_name}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.775rem", color: "var(--text-secondary)" }}>
                      {alert.message}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      title="Acknowledge Alert"
                      style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                    >
                      Ack
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleResolveAlert(alert.id)}
                      title="Mark as Resolved"
                      style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
