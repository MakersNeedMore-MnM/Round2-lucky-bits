import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { CheckSquare, CheckCircle, AlertTriangle, AlertCircle, Shield, ChevronDown, ChevronUp, Server, ArrowRight } from "lucide-react";
import { api } from "../services/api.js";

export function CompliancePage() {
  const { refreshKey } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRule, setExpandedRule] = useState(null);

  useEffect(() => {
    const fetchCompliance = async () => {
      try {
        setLoading(true);
        const res = await api.getCompliance();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCompliance();
  }, [refreshKey]);

  const toggleExpand = (ruleId) => {
    setExpandedRule(prev => prev === ruleId ? null : ruleId);
  };

  if (loading && !data) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ color: "var(--text-secondary)" }}>Auditing CIS benchmark rules across fleet...</p>
      </div>
    );
  }

  const { overall_compliance, total_rules, passing_rules, warning_rules, failing_rules, rules } = data;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
            Security & Compliance Rule Catalog
          </h2>
          <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Standardized CIS Network Benchmarks & NIST 800-53 security controls evaluation
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Fleet Compliance:</span>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: overall_compliance >= 80 ? "#34d399" : "#fbbf24", fontFamily: "var(--font-mono)" }}>
              {overall_compliance}%
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="cyber-card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #38bdf8" }}>
          <CheckSquare size={26} style={{ color: "var(--accent-cyan)" }} />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ACTIVE RULES</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fff" }}>{total_rules}</div>
          </div>
        </div>
        <div className="cyber-card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #10b981" }}>
          <CheckCircle size={26} style={{ color: "#10b981" }} />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>PASSING RULES</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#34d399" }}>{passing_rules}</div>
          </div>
        </div>
        <div className="cyber-card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #f59e0b" }}>
          <AlertTriangle size={26} style={{ color: "#f59e0b" }} />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>WARNING RULES</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fbbf24" }}>{warning_rules}</div>
          </div>
        </div>
        <div className="cyber-card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #ef4444" }}>
          <AlertCircle size={26} style={{ color: "#ef4444" }} />
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>FAILING RULES</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f87171" }}>{failing_rules}</div>
          </div>
        </div>
      </div>

      {/* Rules Registry List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
        {rules.map((rule) => {
          const isExpanded = expandedRule === rule.rule_id;
          const statusCls = rule.status === "PASS" ? "badge-low" : rule.status === "WARNING" ? "badge-medium" : "badge-critical";

          return (
            <div key={rule.rule_id} className="cyber-card" style={{ transition: "border-color 0.2s" }}>
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", flexWrap: "wrap", gap: "1rem" }}
                onClick={() => toggleExpand(rule.rule_id)}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: "var(--accent-cyan)",
                    background: "rgba(6, 182, 212, 0.1)",
                    padding: "0.35rem 0.65rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(6, 182, 212, 0.2)"
                  }}>
                    {rule.rule_id}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
                        {rule.name}
                      </h3>
                      <span className={`badge ${statusCls}`}>
                        {rule.status}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.25rem", maxWidth: "800px" }}>
                      {rule.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Category: <span style={{ color: "#e2e8f0" }}>{rule.category}</span>
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: rule.status === "PASS" ? "#34d399" : rule.status === "WARNING" ? "#fbbf24" : "#f87171" }}>
                      {rule.status === "PASS" ? (
                        `${rule.pass_count}/${rule.total_devices} Devices Pass`
                      ) : (
                        `${rule.affected_count} Device(s) Non-Compliant`
                      )}
                    </div>
                  </div>
                  <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Expandable Affected Devices & Remediation Details */}
              {isExpanded && (
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-color)" }}>
                  <div style={{
                    background: "#080e1a",
                    padding: "0.75rem 1rem",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                    color: "var(--accent-cyan)",
                    marginBottom: "0.75rem"
                  }}>
                    <strong>Recommended Remediation:</strong> {rule.remediation_hint}
                  </div>

                  {rule.affected_devices.length === 0 ? (
                    <div style={{ fontSize: "0.8rem", color: "#34d399", padding: "0.5rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <CheckCircle size={15} /> All 24 devices in the estate satisfy this security control.
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: "0.775rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                        Affected Non-Compliant Devices ({rule.affected_devices.length}):
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.65rem" }}>
                        {rule.affected_devices.map((d) => (
                          <div key={d.id} style={{ background: "#0a1222", border: "1px solid #1e293b", padding: "0.65rem", borderRadius: "6px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                              <Link to={`/devices/${d.id}`} style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", textDecoration: "none" }}>
                                {d.name}
                              </Link>
                              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: d.status === "WARNING" ? "#fbbf24" : "#f87171" }}>
                                {d.status}
                              </span>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                              IP: {d.ip_address} • {d.vendor}
                            </div>
                            <div style={{ fontSize: "0.725rem", color: "#fca5a5", marginTop: "0.3rem" }}>
                              {d.details}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
