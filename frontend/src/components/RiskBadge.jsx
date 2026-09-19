import React from "react";
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert } from "lucide-react";

export function RiskBadge({ level, score }) {
  const normalized = (level || "Low").toLowerCase();

  const config = {
    low: { cls: "badge-low", icon: ShieldCheck, label: "Safe / Low" },
    medium: { cls: "badge-medium", icon: AlertTriangle, label: "Medium" },
    high: { cls: "badge-high", icon: ShieldAlert, label: "High Risk" },
    critical: { cls: "badge-critical", icon: AlertOctagon, label: "Critical" }
  };

  const current = config[normalized] || config.low;
  const Icon = current.icon;

  return (
    <span className={`badge ${current.cls}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
      <Icon size={13} />
      {current.label} {score !== undefined && score !== null ? `(${score})` : ""}
    </span>
  );
}
