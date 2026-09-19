import React from "react";
import { Shield, Server, Cpu, Network } from "lucide-react";

export function VendorBadge({ vendor }) {
  const getStyle = () => {
    switch ((vendor || "").toLowerCase()) {
      case "cisco":
        return { cls: "badge-cisco", label: "Cisco", icon: Network };
      case "fortinet":
        return { cls: "badge-fortinet", label: "Fortinet", icon: Shield };
      case "palo alto":
      case "paloalto":
        return { cls: "badge-paloalto", label: "Palo Alto", icon: Server };
      case "juniper":
        return { cls: "badge-juniper", label: "Juniper", icon: Cpu };
      default:
        return { cls: "badge-cisco", label: vendor, icon: Server };
    }
  };

  const { cls, label, icon: Icon } = getStyle();

  return (
    <span className={`badge ${cls}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
      <Icon size={13} />
      {label}
    </span>
  );
}
