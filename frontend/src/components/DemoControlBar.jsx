import React, { useState } from "react";
import { Play, Zap, AlertTriangle, RotateCcw, ShieldAlert, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { api } from "../services/api.js";

export function DemoControlBar({ onAuditClick, onStateChange }) {
  const [loadingAction, setLoadingAction] = useState(null);
  const [scenarioResult, setScenarioResult] = useState(null);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleFortinetScenario = async () => {
    try {
      setLoadingAction("fortinet");
      const res = await api.runFortinetScenario();
      setScenarioResult(res);
      showNotification("🎯 SIH Demo Scenario applied to Fortinet-Edge-FW! Risk Score updated to 85 (HIGH).", "warning");
      if (onStateChange) onStateChange();
    } catch (err) {
      showNotification(err.message, "danger");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRandomIssue = async () => {
    try {
      setLoadingAction("issue");
      const res = await api.generateRandomIssue();
      showNotification(`⚠️ Security drift injected: ${res.message}`, "warning");
      if (onStateChange) onStateChange();
    } catch (err) {
      showNotification(err.message, "danger");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReset = async () => {
    try {
      setLoadingAction("reset");
      await api.resetDemo();
      showNotification("🔄 Database successfully restored to baseline state (24 devices).", "success");
      if (onStateChange) onStateChange();
    } catch (err) {
      showNotification(err.message, "danger");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div style={{
        background: "linear-gradient(90deg, #091326, #0e1c38)",
        border: "1px solid #1e3a5f",
        borderRadius: "10px",
        padding: "0.75rem 1.25rem",
        marginBottom: "1.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "0.75rem",
        boxShadow: "0 4px 20px rgba(2, 132, 199, 0.15)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <span style={{
            background: "linear-gradient(135deg, #0284c7, #06b6d4)",
            color: "#ffffff",
            padding: "0.35rem 0.65rem",
            borderRadius: "6px",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.05em",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem"
          }}>
            <Sparkles size={13} /> SIH 2026 LIVE DEMO
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Interactive Simulation Controls for Evaluators:
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          {/* 1. Run Full Audit */}
          <button
            className="btn btn-primary btn-sm"
            onClick={onAuditClick}
            disabled={!!loadingAction}
            title="Collect configurations, detect drift, run AI analysis, check compliance"
          >
            <Play size={14} /> Run Full Audit
          </button>

          {/* 2. SIH Fortinet Scenario */}
          <button
            className="btn btn-sm"
            style={{
              background: "linear-gradient(135deg, #ea580c, #c2410c)",
              color: "#fff",
              border: "none",
              fontWeight: 600
            }}
            onClick={handleFortinetScenario}
            disabled={!!loadingAction}
            title="Simulate Logging Disabled + Remote Access Enabled on Fortinet Firewall"
          >
            <ShieldAlert size={14} />
            {loadingAction === "fortinet" ? "Simulating Drift..." : "Simulate Configuration Change"}
          </button>

          {/* 3. Random Security Issue */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleRandomIssue}
            disabled={!!loadingAction}
            title="Inject an unauthorized security violation on a random device"
          >
            <AlertTriangle size={14} style={{ color: "#f59e0b" }} />
            {loadingAction === "issue" ? "Injecting..." : "Generate Security Issue"}
          </button>

          {/* 4. Reset Demo Data */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleReset}
            disabled={!!loadingAction}
            title="Restore baseline 24 devices, clean configs, and baseline metrics"
          >
            <RotateCcw size={14} />
            {loadingAction === "reset" ? "Resetting..." : "Reset Demo Data"}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          background: notification.type === "danger" ? "#7f1d1d" : notification.type === "warning" ? "#78350f" : "#064e3b",
          color: "#fff",
          padding: "0.75rem 1.25rem",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.2)",
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          gap: "0.65rem",
          fontSize: "0.85rem",
          fontWeight: 500,
          animation: "slideIn 0.3s ease"
        }}>
          {notification.type === "danger" ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          {notification.msg}
        </div>
      )}

      {/* SIH Scenario Explainer Modal */}
      {scenarioResult && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(5px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div className="cyber-card" style={{ maxWidth: "680px", width: "100%", background: "#0a1324", border: "1px solid var(--accent-cyan)", padding: "1.75rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(234, 88, 12, 0.2)", color: "#fb923c", padding: "0.25rem 0.6rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700 }}>
                  <ShieldAlert size={14} /> SIH 2026 DEMO SCENARIO EXECUTED
                </div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: "0.5rem", color: "#fff" }}>
                  Fortinet Firewall: Configuration Drift Detected
                </h3>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setScenarioResult(null)}
              >
                ✕ Close
              </button>
            </div>

            {/* Workflow Progression Box */}
            <div style={{
              background: "#080e1a",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1.25rem"
            }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600, marginBottom: "0.5rem" }}>
                Autonomous Compliance Pipeline Response:
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f87171" }}>
                  <ArrowRight size={14} />
                  <span><strong>1. CHANGE DETECTED:</strong> Logging changed (Enabled → Disabled), Remote Access changed (Disabled → Enabled)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#fbbf24" }}>
                  <ArrowRight size={14} />
                  <span><strong>2. COMPLIANCE VIOLATION:</strong> RULE-002 (Logging) FAIL, RULE-003 (Insecure Remote Access) FAIL</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#38bdf8" }}>
                  <ArrowRight size={14} />
                  <span><strong>3. AI RISK ANALYSIS:</strong> Multi-factor engine evaluated 7 parameter weights → <strong>Risk Score: 85 / 100</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f97316" }}>
                  <ArrowRight size={14} />
                  <span><strong>4. RISK LEVEL:</strong> Classified as <strong>HIGH RISK</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#ef4444" }}>
                  <ArrowRight size={14} />
                  <span><strong>5. ALERT DISPATCHED:</strong> Critical/High security incident raised to Security Operations Center</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#34d399" }}>
                  <ArrowRight size={14} />
                  <span><strong>6. REMEDIATION GENERATED:</strong> Exact FortiOS CLI command provided for immediate hardening</span>
                </div>
              </div>
            </div>

            {/* Generated FortiOS Remediation Snippet */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                Recommended FortiOS Hardening Commands:
              </div>
              <pre style={{
                background: "#040810",
                border: "1px solid #1e293b",
                padding: "0.75rem",
                borderRadius: "6px",
                fontSize: "0.775rem",
                color: "#38bdf8",
                overflowX: "auto"
              }}>
{`config log syslogd setting
    set status enable
    set server "192.168.1.250"
    set mode udp
    set port 514
end
config system global
    set admin-telnet disable
    set admin-sport 8443
    set admin-ssh-port 22
end`}
              </pre>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-primary"
                onClick={() => setScenarioResult(null)}
              >
                Continue to Dashboard & Alerts
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
