import React, { useState } from "react";
import { Settings, Shield, Server, Bell, Cpu, Save, CheckCircle, Info } from "lucide-react";

export function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    auditInterval: "15",
    simulationMode: "enabled",
    alertCriticalEmail: true,
    alertHighEmail: true,
    ciscoAdapterType: "simulated",
    fortinetAdapterType: "simulated",
    paloAltoAdapterType: "simulated",
    juniperAdapterType: "simulated",
    webhookUrl: "https://hooks.slack.com/services/SIH2026/DEMO/SECOPS"
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: "1000px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
            Platform & Engine Settings
          </h2>
          <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Audit scheduling, multi-vendor adapter configuration & alert notification thresholds
          </p>
        </div>
      </div>

      {saved && (
        <div style={{
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid rgba(16, 185, 129, 0.4)",
          color: "#34d399",
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          marginBottom: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.85rem"
        }}>
          <CheckCircle size={16} />
          Settings successfully saved and synchronized across auditor nodes.
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Section 1: Multi-Vendor Adapter Integrations */}
        <div className="cyber-card">
          <div className="card-header">
            <span className="card-title">
              <Server size={18} style={{ color: "var(--accent-cyan)" }} />
              Multi-Vendor Device Connection Adapters
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Adapter Pattern</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Configure whether devices operate in simulated sandbox telemetry or connect via live network protocols (SSH / Netmiko / RESTCONF / NETCONF):
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                Cisco Adapter (IOS-XE / NX-OS)
              </label>
              <select
                className="input-field"
                value={settings.ciscoAdapterType}
                onChange={(e) => setSettings({ ...settings, ciscoAdapterType: e.target.value })}
              >
                <option value="simulated">Simulated CLI Telemetry (SIH Sandbox)</option>
                <option value="ssh">Live SSH / Netmiko (Port 22)</option>
                <option value="restconf">Live RESTCONF (RFC 8040 - Port 443)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                Fortinet Adapter (FortiOS)
              </label>
              <select
                className="input-field"
                value={settings.fortinetAdapterType}
                onChange={(e) => setSettings({ ...settings, fortinetAdapterType: e.target.value })}
              >
                <option value="simulated">Simulated FortiOS Telemetry (SIH Sandbox)</option>
                <option value="api">Live FortiOS REST API (/api/v2/cmdb)</option>
                <option value="ssh">Live SSH CLI (Port 22)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                Palo Alto Adapter (PAN-OS)
              </label>
              <select
                className="input-field"
                value={settings.paloAltoAdapterType}
                onChange={(e) => setSettings({ ...settings, paloAltoAdapterType: e.target.value })}
              >
                <option value="simulated">Simulated PAN-OS XML Telemetry (SIH Sandbox)</option>
                <option value="xml_api">Live PAN-OS XML API (/api/?type=config)</option>
                <option value="ssh">Live SSH CLI (Port 22)</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                Juniper Adapter (JunOS)
              </label>
              <select
                className="input-field"
                value={settings.juniperAdapterType}
                onChange={(e) => setSettings({ ...settings, juniperAdapterType: e.target.value })}
              >
                <option value="simulated">Simulated JunOS Telemetry (SIH Sandbox)</option>
                <option value="pyez">Live JunOS PyEZ / NETCONF (RFC 6241)</option>
                <option value="ssh">Live SSH CLI (Port 22)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Audit Scheduling & Engine */}
        <div className="cyber-card">
          <div className="card-header">
            <span className="card-title">
              <Cpu size={18} style={{ color: "var(--accent-cyan)" }} />
              Continuous Compliance Scheduler
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                Automated Configuration Poll Frequency
              </label>
              <select
                className="input-field"
                value={settings.auditInterval}
                onChange={(e) => setSettings({ ...settings, auditInterval: e.target.value })}
              >
                <option value="1">Continuous (Every 1 Minute)</option>
                <option value="15">Standard (Every 15 Minutes)</option>
                <option value="60">Hourly Audit Cycle</option>
                <option value="1440">Daily Regulatory Audit</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                AI Analysis Engine Model Mode
              </label>
              <select
                className="input-field"
                value={settings.simulationMode}
                onChange={(e) => setSettings({ ...settings, simulationMode: e.target.value })}
              >
                <option value="enabled">Deterministic Heuristic ML Model (Explainable)</option>
                <option value="external_onnx">External ONNX Microservice (Random Forest / Isolation Forest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: SIH Project Information Banner */}
        <div className="cyber-card" style={{ background: "#091224", borderColor: "#1e3a5f" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <Info size={22} style={{ color: "var(--accent-cyan)", flexShrink: 0, marginTop: "0.2rem" }} />
            <div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", marginBottom: "0.25rem" }}>
                Smart India Hackathon (SIH 2026) Prototype Specifications
              </h4>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                <strong>Title:</strong> AI-Driven Multi-Vendor Network Security Compliance Auditor<br />
                <strong>Architecture:</strong> Heterogeneous Network Adapter Layer + CIS/NIST Rules Engine + Deterministic AI/ML Anomaly Scorer + Incident Dispatcher.<br />
                <strong>Separation:</strong> Cleanly decouples simulated telemetry from live device sockets, enabling instant field deployment across Cisco, Fortinet, Palo Alto, and Juniper without modifying core compliance or AI analyzer logic.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="btn btn-primary">
            <Save size={16} /> Save Auditor Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
