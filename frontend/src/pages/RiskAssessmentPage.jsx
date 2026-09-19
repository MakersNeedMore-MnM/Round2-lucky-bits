import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { ShieldAlert, AlertTriangle, CheckCircle, ArrowRight, Server, Terminal, Shield } from "lucide-react";
import { api } from "../services/api.js";
import { VendorBadge } from "../components/VendorBadge.jsx";
import { RiskBadge } from "../components/RiskBadge.jsx";

export function RiskAssessmentPage() {
  const { refreshKey } = useOutletContext();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState("All");

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const data = await api.getRiskAssessments();
        setAssessments(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, [refreshKey]);

  const filteredAssessments = assessments.filter(a => {
    if (tierFilter === "All") return true;
    return a.risk_level === tierFilter;
  });

  const criticalCount = assessments.filter(a => a.risk_level === "Critical").length;
  const highCount = assessments.filter(a => a.risk_level === "High").length;
  const mediumCount = assessments.filter(a => a.risk_level === "Medium").length;
  const lowCount = assessments.filter(a => a.risk_level === "Low").length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
            Network Risk Assessment & Threat Modeling
          </h2>
          <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Prioritized asset risk scoring, security anomaly exposure, and concrete hardening guides
          </p>
        </div>

        {/* Tier Filter Buttons */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          <button
            className={`btn btn-sm ${tierFilter === "All" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setTierFilter("All")}
          >
            All ({assessments.length})
          </button>
          <button
            className={`btn btn-sm ${tierFilter === "Critical" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setTierFilter("Critical")}
          >
            Critical ({criticalCount})
          </button>
          <button
            className={`btn btn-sm ${tierFilter === "High" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setTierFilter("High")}
          >
            High ({highCount})
          </button>
          <button
            className={`btn btn-sm ${tierFilter === "Medium" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setTierFilter("Medium")}
          >
            Medium ({mediumCount})
          </button>
          <button
            className={`btn btn-sm ${tierFilter === "Low" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setTierFilter("Low")}
          >
            Safe ({lowCount})
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p style={{ color: "var(--text-secondary)" }}>Aggregating risk assessment metrics...</p>
        </div>
      ) : filteredAssessments.length === 0 ? (
        <div className="cyber-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--text-muted)" }}>No devices found for the selected risk filter.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {filteredAssessments.map((item) => (
            <div
              key={item.device_id}
              className="cyber-card"
              style={{
                borderLeft: `4px solid ${
                  item.risk_level === "Critical" ? "#ef4444" :
                  item.risk_level === "High" ? "#f97316" :
                  item.risk_level === "Medium" ? "#f59e0b" : "#10b981"
                }`
              }}
            >
              {/* Header Bar */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>
                      <Link to={`/devices/${item.device_id}`} style={{ color: "#fff", textDecoration: "none" }}>
                        {item.device_name}
                      </Link>
                    </h3>
                    <VendorBadge vendor={item.vendor} />
                    <RiskBadge level={item.risk_level} score={item.risk_score} />
                  </div>
                  <div style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Model: {item.model} • IP: <span style={{ fontFamily: "var(--font-mono)", color: "#38bdf8" }}>{item.ip_address}</span> • Compliance: {item.compliance_score}%
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Calculated Risk:</span>
                  <div style={{
                    fontSize: "1.4rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    color: item.risk_level === "Critical" ? "#ef4444" : item.risk_level === "High" ? "#f97316" : item.risk_level === "Medium" ? "#f59e0b" : "#10b981"
                  }}>
                    {item.risk_score} <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>/ 100</span>
                  </div>
                </div>
              </div>

              {/* Two Column Layout: Detected Problems & Recommended Actions */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                {/* 1. Detected Problems */}
                <div style={{ background: "#09101f", padding: "1rem", borderRadius: "8px", border: "1px solid #16243d" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fca5a5", marginBottom: "0.65rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Detected Vulnerabilities ({item.detected_problems?.length || 0}):
                  </div>

                  {(!item.detected_problems || item.detected_problems.length === 0) ? (
                    <div style={{ fontSize: "0.8rem", color: "#34d399", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <CheckCircle size={16} /> Device conforms to security baseline. No active vulnerabilities detected.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {item.detected_problems.map((p, pIdx) => (
                        <div key={pIdx} style={{ fontSize: "0.8rem", borderLeft: "2px solid #ef4444", paddingLeft: "0.6rem" }}>
                          <div style={{ fontWeight: 600, color: "#f87171" }}>
                            {pIdx + 1}. {p.problem}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                            <em>{p.why_it_matters}</em>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Recommended Actions */}
                <div style={{ background: "#09101f", padding: "1rem", borderRadius: "8px", border: "1px solid #16243d" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--accent-cyan)", marginBottom: "0.65rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    Recommended Actions & Remediation:
                  </div>

                  {(!item.recommendations || item.recommendations.length === 0) ? (
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      Maintain existing automated periodic compliance scanning.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                      {item.recommendations.map((rec, rIdx) => (
                        <div key={rIdx} style={{ fontSize: "0.8rem" }}>
                          <div style={{ fontWeight: 600, color: "#fff" }}>
                            {rIdx + 1}. {rec.title}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                            {rec.action}
                          </div>
                          {rec.remediation_cli && (
                            <pre style={{
                              background: "#040810",
                              border: "1px solid #1e293b",
                              padding: "0.4rem 0.6rem",
                              borderRadius: "4px",
                              fontSize: "0.7rem",
                              color: "#38bdf8",
                              marginTop: "0.35rem",
                              overflowX: "auto"
                            }}>
                              {rec.remediation_cli}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
