import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowLeft,
  Server,
  Play,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Terminal,
  ShieldCheck,
  Calendar,
  MapPin,
  Cpu,
  History,
  CheckSquare
} from "lucide-react";
import { api } from "../services/api.js";
import { VendorBadge } from "../components/VendorBadge.jsx";
import { RiskBadge } from "../components/RiskBadge.jsx";
import { ConfigDiffViewer } from "../components/ConfigDiffViewer.jsx";

export function DeviceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshKey, triggerRefresh } = useOutletContext();
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auditing, setAuditing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getDeviceById(id);
      setDeviceData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id, refreshKey]);

  const handleAudit = async () => {
    try {
      setAuditing(true);
      await api.auditDevice(id);
      await fetchDetails();
      triggerRefresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setAuditing(false);
    }
  };

  if (loading && !deviceData) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading device configuration telemetry...</p>
      </div>
    );
  }

  if (error || !deviceData) {
    return (
      <div className="cyber-card" style={{ textAlign: "center", padding: "3rem" }}>
        <h3 style={{ color: "#fff", marginBottom: "0.5rem" }}>Device Not Found</h3>
        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>{error || "Unable to retrieve device records."}</p>
        <Link to="/devices" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to Devices List
        </Link>
      </div>
    );
  }

  const { device, currentConfig, previousConfig, currentConfigRow, previousConfigRow, complianceResults, riskAssessment, changes } = deviceData;

  return (
    <div>
      {/* Back Link */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => navigate("/devices")}
          className="btn btn-secondary btn-sm"
          style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}
        >
          <ArrowLeft size={14} /> Back to Inventory
        </button>
      </div>

      {/* Device Hardware Banner Card */}
      <div className="cyber-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff" }}>
                {device.name}
              </h2>
              <VendorBadge vendor={device.vendor} />
              <RiskBadge level={device.risk_level} score={device.risk_score} />
            </div>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.825rem", color: "var(--text-secondary)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <Server size={14} style={{ color: "var(--accent-cyan)" }} /> Model: <strong>{device.model} ({device.device_type})</strong>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <Cpu size={14} style={{ color: "var(--accent-cyan)" }} /> IP: <strong style={{ fontFamily: "var(--font-mono)", color: "#38bdf8" }}>{device.ip_address}</strong>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <MapPin size={14} style={{ color: "var(--accent-cyan)" }} /> Location: <strong>{device.location}</strong>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                <Calendar size={14} style={{ color: "var(--accent-cyan)" }} /> Last Audit: <strong>{device.last_audit ? new Date(device.last_audit).toLocaleString() : "Never"}</strong>
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ textAlign: "right", marginRight: "0.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Compliance Score</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: device.compliance_score >= 80 ? "#10b981" : "#f59e0b", fontFamily: "var(--font-mono)" }}>
                {device.compliance_score}%
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleAudit}
              disabled={auditing}
            >
              <Play size={16} /> {auditing ? "Executing Audit..." : "Run Device Audit"}
            </button>
          </div>
        </div>
      </div>

      {/* Side-by-Side Configuration Diff Highlighting (GREEN, YELLOW, RED) */}
      <ConfigDiffViewer
        previousConfig={previousConfig}
        currentConfig={currentConfig}
        previousRaw={previousConfigRow?.raw_config}
        currentRaw={currentConfigRow?.raw_config}
      />

      {/* CIS / NIST Compliance Results Table */}
      <div className="cyber-card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header">
          <span className="card-title">
            <CheckSquare size={18} style={{ color: "var(--accent-cyan)" }} />
            CIS Benchmark & Security Policy Verification
          </span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {complianceResults.filter(r => r.status === "PASS").length} / {complianceResults.length} Rules Passed
          </span>
        </div>

        <div className="cyber-table-container">
          <table className="cyber-table">
            <thead>
              <tr>
                <th>Rule ID</th>
                <th>Security Control</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Details & Remediation Hint</th>
              </tr>
            </thead>
            <tbody>
              {complianceResults.map((r) => (
                <tr key={r.rule_id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "0.8rem", color: "var(--accent-cyan)" }}>
                    {r.rule_id}
                  </td>
                  <td style={{ fontWeight: 600 }}>{r.rule_name}</td>
                  <td style={{ color: "var(--text-secondary)" }}>{r.category}</td>
                  <td>
                    <span style={{
                      fontSize: "0.725rem",
                      fontWeight: 600,
                      color: r.severity === "Critical" ? "#f87171" : r.severity === "High" ? "#fb923c" : "#facc15"
                    }}>
                      {r.severity}
                    </span>
                  </td>
                  <td>
                    {r.status === "PASS" ? (
                      <span className="badge badge-low">
                        <CheckCircle size={12} /> PASS
                      </span>
                    ) : r.status === "WARNING" ? (
                      <span className="badge badge-medium">
                        <AlertTriangle size={12} /> WARNING
                      </span>
                    ) : (
                      <span className="badge badge-critical">
                        <AlertCircle size={12} /> FAIL
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: "0.8rem" }}>
                    <div style={{ color: r.status === "PASS" ? "var(--text-secondary)" : "#f87171" }}>
                      {r.details}
                    </div>
                    {r.status !== "PASS" && r.remediation_hint && (
                      <div style={{ fontSize: "0.725rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                        💡 <em>Hint: {r.remediation_hint}</em>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Risk Assessment Details & Remediations */}
      {riskAssessment && (
        <div className="cyber-card" style={{ marginTop: "1.5rem" }}>
          <div className="card-header">
            <span className="card-title">
              <ShieldCheck size={18} style={{ color: "var(--accent-cyan)" }} />
              AI Risk Assessment & Actionable Remediations
            </span>
            <RiskBadge level={riskAssessment.risk_level} score={riskAssessment.risk_score} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            {/* Detected Problems */}
            <div>
              <h4 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.75rem", fontWeight: 600 }}>
                Detected Security Anomalies ({riskAssessment.detected_problems?.length || 0}):
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {(riskAssessment.detected_problems || []).map((prob, idx) => (
                  <div key={idx} style={{ background: "#0a1222", borderLeft: "3px solid #ef4444", padding: "0.75rem", borderRadius: "6px" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f87171" }}>
                      {idx + 1}. {prob.problem}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                      <strong>Impact:</strong> {prob.why_it_matters}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended CLI Actions */}
            <div>
              <h4 style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.75rem", fontWeight: 600 }}>
                Prioritized Action Items:
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {(riskAssessment.recommendations || []).map((rec, idx) => (
                  <div key={idx} style={{ background: "#0a1222", border: "1px solid var(--border-color)", padding: "0.75rem", borderRadius: "6px" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent-cyan)" }}>
                      {rec.title}
                    </div>
                    <div style={{ fontSize: "0.775rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                      {rec.action}
                    </div>
                    {rec.remediation_cli && (
                      <pre style={{
                        background: "#040810",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.725rem",
                        color: "#38bdf8",
                        marginTop: "0.5rem",
                        overflowX: "auto"
                      }}>
                        {rec.remediation_cli}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
