import React, { useState, useEffect } from "react";
import { FileText, Download, Printer, Plus, CheckCircle, ShieldAlert, AlertTriangle, ArrowRight, Calendar, User } from "lucide-react";
import { api } from "../services/api.js";
import { VendorBadge } from "../components/VendorBadge.jsx";
import { RiskBadge } from "../components/RiskBadge.jsx";

export function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchLatestReport = async () => {
    try {
      setLoading(true);
      const reports = await api.getReports();
      if (reports.length > 0) {
        // Parse summary_json of newest report
        const latest = reports[0];
        setReport({
          ...latest,
          ...JSON.parse(latest.summary_json)
        });
      } else {
        // Auto-generate initial report
        handleGenerateReport();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestReport();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      const res = await api.generateReport(
        `SIH-2026 Executive Network Security & Compliance Audit - ${new Date().toLocaleDateString()}`,
        "SecOps Lead Auditor"
      );
      setReport(res);
    } catch (e) {
      alert(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header & Print Actions */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
            Audit & Compliance Reports
          </h2>
          <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Generate and export formal cybersecurity audit reports with executive summaries and remediation plans
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-secondary" onClick={handleDownloadJSON} disabled={!report}>
            <Download size={15} /> Export JSON
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} disabled={!report}>
            <Printer size={15} /> Print / Save as PDF
          </button>
          <button className="btn btn-primary" onClick={handleGenerateReport} disabled={generating}>
            <Plus size={15} /> {generating ? "Generating..." : "Generate New Audit Report"}
          </button>
        </div>
      </div>

      {loading && !report ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p style={{ color: "var(--text-secondary)" }}>Compiling formal compliance audit dossier...</p>
        </div>
      ) : !report ? (
        <div className="cyber-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--text-secondary)" }}>No reports compiled yet.</p>
        </div>
      ) : (
        <div className="report-paper">
          {/* Audit Summary KPI Bar */}
          <div className="cyber-card" style={{ marginBottom: "1.5rem" }}>
            <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
              Audit Summary Posture
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Total Devices</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fff", fontFamily: "var(--font-mono)" }}>
                  {report.total_devices}
                </div>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Compliance Score</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#34d399", fontFamily: "var(--font-mono)" }}>
                  {report.overall_compliance}%
                </div>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Critical Issues</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#ef4444", fontFamily: "var(--font-mono)" }}>
                  {report.critical_issues}
                </div>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>High Risk Issues</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f97316", fontFamily: "var(--font-mono)" }}>
                  {report.high_risk_issues}
                </div>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Medium Risk</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#f59e0b", fontFamily: "var(--font-mono)" }}>
                  {report.medium_risk_issues}
                </div>
              </div>
              <div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Safe Devices</span>
                <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#10b981", fontFamily: "var(--font-mono)" }}>
                  {report.low_risk_issues}
                </div>
              </div>
            </div>
          </div>

          {/* REPORT SECTION 1: Executive Summary */}
          <div className="cyber-card" style={{ marginBottom: "1.5rem" }}>
            <div className="card-header">
              <span className="card-title">
                <FileText size={18} style={{ color: "var(--accent-cyan)" }} />
                1. Executive Summary
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Audited: {new Date(report.generated_at).toLocaleString()}
              </span>
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-primary)", lineHeight: 1.7 }}>
              <p style={{ marginBottom: "0.75rem" }}>
                <strong>Scope of Evaluation:</strong> {report.executiveSummary?.scope}
              </p>
              <p style={{ marginBottom: "0.75rem" }}>
                <strong>Overall Estate Posture:</strong>{" "}
                <span style={{
                  padding: "0.2rem 0.6rem",
                  borderRadius: "4px",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  background: report.critical_issues > 0 ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                  color: report.critical_issues > 0 ? "#f87171" : "#34d399"
                }}>
                  {report.executiveSummary?.overall_health}
                </span>
              </p>
              <p>
                <strong>Key Findings:</strong> {report.executiveSummary?.key_finding}
              </p>
            </div>
          </div>

          {/* REPORT SECTION 2: Device Summary */}
          <div className="cyber-card" style={{ marginBottom: "1.5rem" }}>
            <div className="card-header">
              <span className="card-title">
                <FileText size={18} style={{ color: "var(--accent-cyan)" }} />
                2. Device Inventory & Posture Summary
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {report.deviceSummary?.length} Registered Nodes
              </span>
            </div>
            <div className="cyber-table-container">
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Vendor</th>
                    <th>Type</th>
                    <th>IP Address</th>
                    <th>Compliance</th>
                    <th>Risk Tier</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.deviceSummary || []).slice(0, 10).map((d) => (
                    <tr key={d.id}>
                      <td style={{ fontWeight: 600 }}>{d.name}</td>
                      <td><VendorBadge vendor={d.vendor} /></td>
                      <td style={{ color: "var(--text-secondary)" }}>{d.device_type}</td>
                      <td style={{ fontFamily: "var(--font-mono)", color: "#38bdf8", fontSize: "0.8rem" }}>{d.ip_address}</td>
                      <td style={{ fontWeight: 600 }}>{d.compliance_score}%</td>
                      <td><RiskBadge level={d.risk_level} score={d.risk_score} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", textAlign: "right" }}>
              Showing top 10 devices ranked by threat exposure.
            </div>
          </div>

          {/* REPORT SECTION 3: Configuration Changes */}
          <div className="cyber-card" style={{ marginBottom: "1.5rem" }}>
            <div className="card-header">
              <span className="card-title">
                <FileText size={18} style={{ color: "var(--accent-cyan)" }} />
                3. Configuration Changes & Drift Audit Trail
              </span>
            </div>
            <div className="cyber-table-container">
              <table className="cyber-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Setting</th>
                    <th>Drift</th>
                    <th>Authorization</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {(report.configurationChanges || []).map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.device_name}</td>
                      <td>{c.setting_name}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
                        {c.previous_value} → <span style={{ color: "#f87171" }}>{c.current_value}</span>
                      </td>
                      <td>{c.change_type}</td>
                      <td><RiskBadge level={c.risk_level} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* REPORT SECTION 4: Compliance Violations */}
          <div className="cyber-card" style={{ marginBottom: "1.5rem" }}>
            <div className="card-header">
              <span className="card-title">
                <FileText size={18} style={{ color: "var(--accent-cyan)" }} />
                4. Compliance Violations by Framework
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {(report.complianceViolations || []).map((v) => (
                <div key={v.rule_id} style={{ background: "#09101f", borderLeft: "3px solid #ef4444", padding: "0.75rem 1rem", borderRadius: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>
                      {v.rule_id}: {v.rule_name}
                    </span>
                    <span style={{ color: "#f87171", fontWeight: 700, fontSize: "0.8rem" }}>
                      {v.fail_count} Device(s) Failing
                    </span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                    Category: {v.category} • Severity: {v.severity}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REPORT SECTION 5: Risk Assessment */}
          <div className="cyber-card" style={{ marginBottom: "1.5rem" }}>
            <div className="card-header">
              <span className="card-title">
                <FileText size={18} style={{ color: "var(--accent-cyan)" }} />
                5. AI Risk Assessment & Vulnerability Breakdown
              </span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Composite multi-factor anomaly scoring evaluated against CIS impact weights. The estate currently displays {report.riskAssessment?.total_issues} flagged assets across Critical, High, and Medium tiers.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
              <div style={{ background: "#070d18", border: "1px solid #ef4444", padding: "0.75rem", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "#f87171", fontWeight: 600 }}>CRITICAL RISK</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ef4444" }}>{report.riskAssessment?.critical}</div>
              </div>
              <div style={{ background: "#070d18", border: "1px solid #f97316", padding: "0.75rem", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "#fb923c", fontWeight: 600 }}>HIGH RISK</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f97316" }}>{report.riskAssessment?.high}</div>
              </div>
              <div style={{ background: "#070d18", border: "1px solid #f59e0b", padding: "0.75rem", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "#fbbf24", fontWeight: 600 }}>MEDIUM RISK</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b" }}>{report.riskAssessment?.warning}</div>
              </div>
              <div style={{ background: "#070d18", border: "1px solid #10b981", padding: "0.75rem", borderRadius: "6px", textAlign: "center" }}>
                <div style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: 600 }}>SAFE / LOW RISK</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#10b981" }}>{report.riskAssessment?.safe}</div>
              </div>
            </div>
          </div>

          {/* REPORT SECTION 6: Actionable Recommendations */}
          <div className="cyber-card">
            <div className="card-header">
              <span className="card-title">
                <FileText size={18} style={{ color: "var(--accent-cyan)" }} />
                6. Prioritized Actionable Recommendations
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {(report.recommendations || []).map((recGroup, gIdx) => (
                <div key={gIdx} style={{ background: "#09101f", padding: "1rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontWeight: 700, color: "#fff" }}>
                      Target: {recGroup.device_name} ({recGroup.vendor} - {recGroup.ip_address})
                    </span>
                    <RiskBadge level={recGroup.risk_level} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {(recGroup.recommendations || []).map((rec, rIdx) => (
                      <div key={rIdx} style={{ fontSize: "0.825rem" }}>
                        <div style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>
                          • {rec.title}: {rec.action}
                        </div>
                        {rec.remediation_cli && (
                          <pre style={{
                            background: "#040810",
                            padding: "0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.725rem",
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
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
