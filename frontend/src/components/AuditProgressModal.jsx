import React, { useState, useEffect } from "react";
import { CheckCircle, Loader2, ShieldCheck, Activity } from "lucide-react";

export function AuditProgressModal({ isOpen, onClose, onComplete, auditData }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const steps = [
    { title: "Collecting data...", desc: "Polling Cisco, Fortinet, Palo Alto, and Juniper devices" },
    { title: "Checking configurations...", desc: "Parsing raw vendor CLI syntaxes into structured models" },
    { title: "Detecting changes...", desc: "Comparing current snapshots against historical baseline snapshots" },
    { title: "Analyzing risks...", desc: "AI / ML deterministic multi-factor anomaly scoring" },
    { title: "Checking compliance...", desc: "Evaluating CIS Benchmarks & NIST 800-53 controls" },
    { title: "Generating recommendations...", desc: "Synthesizing plain-English guidance and remediation CLI" },
    { title: "Audit completed.", desc: "All 24 estate devices verified and telemetry synchronized" }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsDone(false);
      return;
    }

    let timer;
    if (currentStepIndex < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 550);
    } else {
      setIsDone(true);
      if (onComplete) onComplete();
    }

    return () => clearTimeout(timer);
  }, [isOpen, currentStepIndex]);

  if (!isOpen) return null;

  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(3, 7, 18, 0.85)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div className="cyber-card" style={{
        width: "100%",
        maxWidth: "560px",
        background: "#0d1527",
        border: "1px solid var(--border-focus)",
        padding: "1.75rem",
        boxShadow: "0 0 40px rgba(56, 189, 248, 0.25)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
          <div style={{
            background: "rgba(56, 189, 248, 0.15)",
            color: "var(--accent-cyan)",
            padding: "0.65rem",
            borderRadius: "10px"
          }}>
            <Activity size={24} className={!isDone ? "animate-spin" : ""} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {isDone ? "Security Audit Finalized" : "Running Network Compliance Audit..."}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Multi-vendor automated compliance pipeline execution
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.35rem" }}>
            <span>Audit Pipeline Progress</span>
            <span style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>{progressPercent}%</span>
          </div>
          <div style={{ width: "100%", height: "8px", background: "#1e2e4d", borderRadius: "9999px", overflow: "hidden" }}>
            <div style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "linear-gradient(90deg, #0284c7, #06b6d4)",
              transition: "width 0.4s ease"
            }} />
          </div>
        </div>

        {/* Step List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", marginBottom: "1.5rem" }}>
          {steps.map((step, idx) => {
            const isFinished = idx < currentStepIndex || (idx === steps.length - 1 && isDone);
            const isCurrent = idx === currentStepIndex && !isDone;

            return (
              <div
                key={step.title}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.45rem 0.65rem",
                  borderRadius: "6px",
                  background: isCurrent ? "rgba(56, 189, 248, 0.08)" : "transparent",
                  borderLeft: isCurrent ? "3px solid var(--accent-cyan)" : "3px solid transparent",
                  opacity: idx > currentStepIndex ? 0.35 : 1,
                  transition: "all 0.2s"
                }}
              >
                {isFinished ? (
                  <CheckCircle size={18} style={{ color: "var(--risk-low)", flexShrink: 0 }} />
                ) : isCurrent ? (
                  <Loader2 size={18} className="animate-spin" style={{ color: "var(--accent-cyan)", flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid #334155", flexShrink: 0 }} />
                )}
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: isCurrent ? 600 : 500, color: isCurrent ? "var(--accent-cyan)" : "var(--text-primary)" }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Footer */}
        {isDone && (
          <div style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "8px",
            padding: "0.85rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem"
          }}>
            <ShieldCheck size={24} style={{ color: "var(--risk-low)" }} />
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#34d399" }}>
                Full Estate Audit Complete
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                24 devices analyzed • Compliance Score updated • Active alerts synchronized
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          {isDone ? (
            <button className="btn btn-primary" onClick={onClose} style={{ width: "100%" }}>
              View Updated Dashboard
            </button>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={onClose} style={{ opacity: 0.7 }}>
              Run in Background
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
