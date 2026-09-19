import React, { useState, useEffect } from "react";
import { Cpu, Sliders, ShieldAlert, Sparkles, CheckCircle2, ArrowRight, BarChart2, Zap, Layers, AlertTriangle } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { api } from "../services/api.js";
import { RiskBadge } from "../components/RiskBadge.jsx";

export function AiAnalysisPage() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Interactive Sandbox State
  const [sandboxParams, setSandboxParams] = useState({
    vendor: "Fortinet",
    logging: "Enabled",
    remote_access: "Disabled",
    password_policy: "Strong",
    default_deny: true,
    snmp_version: "v3",
    http_web_access: false,
    unauthorized_changes_count: 0
  });

  const [sandboxResult, setSandboxResult] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await api.getRiskOverview();
        setModelInfo(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  // Run simulation whenever sandbox params change
  useEffect(() => {
    const runSim = async () => {
      try {
        const res = await api.simulateRiskSandbox(sandboxParams);
        setSandboxResult(res.riskResult);
      } catch (e) {
        console.error(e);
      }
    };
    runSim();
  }, [sandboxParams]);

  const featureWeightsData = [
    { name: "Remote Access Surface", weight: 32, feature: "f_remote", desc: "Telnet/Insecure transport exposure" },
    { name: "Audit Logging Status", weight: 26, feature: "f_logging", desc: "Absence of syslog / SIEM audit trail" },
    { name: "Password & Auth Strength", weight: 20, feature: "f_auth", desc: "Short passwords & weak encryption" },
    { name: "Perimeter Default Deny", weight: 14, feature: "f_perimeter", desc: "Permissive ingress firewall ACLs" },
    { name: "Compliance Failure Ratio", weight: 12, feature: "f_compliance", desc: "Failed CIS Benchmark controls" },
    { name: "Legacy Crypto (SNMP/HTTP)", weight: 8, feature: "f_crypto", desc: "Cleartext management protocols" },
    { name: "Config Drift Volatility", weight: 6, feature: "f_drift", desc: "Rapid unauthorized parameter delta" }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(6, 182, 212, 0.15)", color: "var(--accent-cyan)", padding: "0.25rem 0.6rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          <Sparkles size={14} /> HEURISTIC FEATURE EXTRACTION & RISK CLASSIFICATION ENGINE
        </div>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff" }}>
          AI / ML Risk Analysis Architecture
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem", maxWidth: "900px" }}>
          Transparent, deterministic multi-factor risk assessment model with numerical feature extraction, calibrated risk weighting, and extensible interfaces for supervised learning models (Random Forest / Isolation Forest).
        </p>
      </div>

      {/* Architecture Workflow Strip */}
      <div className="cyber-card" style={{ marginBottom: "1.5rem", background: "#0a1324" }}>
        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-cyan)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Machine Learning Pipeline Architecture:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ background: "#060c18", padding: "0.85rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>STAGE 1</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginTop: "0.2rem" }}>Multi-Vendor Ingestion</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
              Cisco IOS, FortiOS, PAN-OS, JunOS CLI syntax normalization
            </div>
          </div>
          <div style={{ background: "#060c18", padding: "0.85rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>STAGE 2</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginTop: "0.2rem" }}>Feature Extraction</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
              Maps discrete configurations into 7-dimension continuous vector [f1..f7]
            </div>
          </div>
          <div style={{ background: "#060c18", padding: "0.85rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>STAGE 3</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--accent-cyan)", marginTop: "0.2rem" }}>Deterministic Scoring</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
              Multi-factor weighted heuristic function computing score (0–100)
            </div>
          </div>
          <div style={{ background: "#060c18", padding: "0.85rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>STAGE 4</div>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", marginTop: "0.2rem" }}>ML Model Extension</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.3rem" }}>
              Plugs into Random Forest Classifier or Isolation Forest via ONNX Runtime
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive AI Sandbox Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Sandbox Controls Form */}
        <div className="cyber-card">
          <div className="card-header">
            <span className="card-title">
              <Sliders size={18} style={{ color: "var(--accent-cyan)" }} />
              Interactive AI Risk Simulator
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Live Parameter Tuning</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
            Adjust device configuration attributes below to observe how the AI feature extractor recalculates the composite Risk Score in real time:
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Vendor */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                Target Vendor Architecture
              </label>
              <select
                className="input-field"
                value={sandboxParams.vendor}
                onChange={(e) => setSandboxParams({ ...sandboxParams, vendor: e.target.value })}
              >
                <option value="Fortinet">Fortinet (FortiOS)</option>
                <option value="Cisco">Cisco (IOS-XE / NX-OS)</option>
                <option value="Palo Alto">Palo Alto (PAN-OS)</option>
                <option value="Juniper">Juniper (JunOS)</option>
              </select>
            </div>

            {/* Logging & Remote Access (The SIH Scenario triggers!) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                  Audit Logging Status
                </label>
                <select
                  className="input-field"
                  value={sandboxParams.logging}
                  onChange={(e) => setSandboxParams({ ...sandboxParams, logging: e.target.value })}
                >
                  <option value="Enabled">Enabled (Compliant)</option>
                  <option value="Disabled">Disabled (High Risk)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                  Remote Access Protocol
                </label>
                <select
                  className="input-field"
                  value={sandboxParams.remote_access}
                  onChange={(e) => setSandboxParams({ ...sandboxParams, remote_access: e.target.value })}
                >
                  <option value="Disabled">Disabled / Hardened SSH</option>
                  <option value="Enabled">Enabled (Telnet/Plaintext)</option>
                </select>
              </div>
            </div>

            {/* Password Policy & Default Deny */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                  Password Complexity Policy
                </label>
                <select
                  className="input-field"
                  value={sandboxParams.password_policy}
                  onChange={(e) => setSandboxParams({ ...sandboxParams, password_policy: e.target.value })}
                >
                  <option value="Strong">Strong (12+ chars, hashed)</option>
                  <option value="Moderate">Moderate (8 chars)</option>
                  <option value="Weak">Weak (&lt; 8 chars, reversible)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                  Perimeter Default Deny
                </label>
                <select
                  className="input-field"
                  value={sandboxParams.default_deny ? "true" : "false"}
                  onChange={(e) => setSandboxParams({ ...sandboxParams, default_deny: e.target.value === "true" })}
                >
                  <option value="true">Enforced (Drop Inbound)</option>
                  <option value="false">Permissive (Allow All)</option>
                </select>
              </div>
            </div>

            {/* SNMP & HTTP Web Access */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                  SNMP Management Version
                </label>
                <select
                  className="input-field"
                  value={sandboxParams.snmp_version}
                  onChange={(e) => setSandboxParams({ ...sandboxParams, snmp_version: e.target.value })}
                >
                  <option value="v3">SNMPv3 (Encrypted Auth/Priv)</option>
                  <option value="v2c">SNMPv2c (Cleartext string)</option>
                  <option value="v1">SNMPv1 (Legacy cleartext)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                  HTTP Plaintext Web UI
                </label>
                <select
                  className="input-field"
                  value={sandboxParams.http_web_access ? "true" : "false"}
                  onChange={(e) => setSandboxParams({ ...sandboxParams, http_web_access: e.target.value === "true" })}
                >
                  <option value="false">Disabled (HTTPS only)</option>
                  <option value="true">Enabled (Plaintext HTTP active)</option>
                </select>
              </div>
            </div>

            {/* Quick Demo Scenario Preset Button */}
            <div style={{ marginTop: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSandboxParams({
                  vendor: "Fortinet",
                  logging: "Disabled",
                  remote_access: "Enabled",
                  password_policy: "Strong",
                  default_deny: true,
                  snmp_version: "v3",
                  http_web_access: false,
                  unauthorized_changes_count: 2
                })}
              >
                Load SIH Fortinet Scenario Parameters (Score ~85)
              </button>
            </div>
          </div>
        </div>

        {/* Live Evaluation Prediction Output */}
        <div className="cyber-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="card-header">
              <span className="card-title">
                <Cpu size={18} style={{ color: "var(--accent-cyan)" }} />
                Real-Time AI Evaluation
              </span>
              <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>Deterministic</span>
            </div>

            {sandboxResult ? (
              <div>
                {/* Large Risk Score Display */}
                <div style={{
                  background: "#080f1d",
                  border: "1px solid #1e293b",
                  borderRadius: "10px",
                  padding: "1.25rem",
                  textAlign: "center",
                  marginBottom: "1.25rem"
                }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>
                    Calculated Composite Risk Score:
                  </div>
                  <div style={{
                    fontSize: "3.2rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    color: sandboxResult.riskScore >= 85 ? "#ef4444" : sandboxResult.riskScore >= 61 ? "#f97316" : sandboxResult.riskScore >= 31 ? "#f59e0b" : "#10b981",
                    lineHeight: 1.1,
                    margin: "0.3rem 0"
                  }}>
                    {sandboxResult.riskScore} <span style={{ fontSize: "1.4rem", color: "var(--text-muted)" }}>/ 100</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", alignItems: "center" }}>
                    <RiskBadge level={sandboxResult.riskLevel} />
                    <span style={{ fontSize: "0.775rem", color: "var(--text-secondary)" }}>
                      Anomaly Confidence: <strong>{Math.round(sandboxResult.anomalyConfidence * 100)}%</strong>
                    </span>
                  </div>
                </div>

                {/* Detected Reasons */}
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                    Risk Driving Features ({sandboxResult.detectedProblems.length}):
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    {sandboxResult.detectedProblems.map((prob, idx) => (
                      <div key={idx} style={{ fontSize: "0.775rem", color: "#fca5a5", background: "rgba(239, 68, 68, 0.1)", padding: "0.45rem 0.65rem", borderRadius: "4px", borderLeft: "3px solid #ef4444" }}>
                        • {prob.problem}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Recommendation */}
                <div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                    AI Remediation Recommendation:
                  </div>
                  <div style={{ fontSize: "0.775rem", color: "var(--text-primary)", background: "rgba(56, 189, 248, 0.08)", padding: "0.65rem", borderRadius: "6px", border: "1px solid rgba(56, 189, 248, 0.2)" }}>
                    {sandboxResult.recommendations.map(r => r.title).join(", ")}.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ color: "var(--text-secondary)" }}>Calculating...</p>
              </div>
            )}
          </div>

          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem", fontSize: "0.725rem", color: "var(--text-muted)" }}>
            * Uses explainable feature extraction model designed for drop-in replacement with Random Forest or Isolation Forest models.
          </div>
        </div>
      </div>

      {/* Feature Importance Bar Chart */}
      <div className="cyber-card">
        <div className="card-header">
          <span className="card-title">
            <BarChart2 size={18} style={{ color: "var(--accent-cyan)" }} />
            Feature Importance & Weight Distribution
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Calibrated CIS Impact Weights</span>
        </div>
        <div style={{ height: "220px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureWeightsData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
              <XAxis type="number" stroke="#64748b" fontSize={12} domain={[0, 35]} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} width={170} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#fff" }}
              />
              <Bar dataKey="weight" fill="#0284c7" radius={[0, 4, 4, 0]}>
                {featureWeightsData.map((entry, idx) => {
                  const colors = ["#ef4444", "#f97316", "#f59e0b", "#06b6d4", "#3b82f6", "#8b5cf6", "#10b981"];
                  return <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
