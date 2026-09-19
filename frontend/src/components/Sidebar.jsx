import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Server,
  Sliders,
  History,
  CheckSquare,
  ShieldAlert,
  Cpu,
  Bell,
  FileText,
  Settings,
  Shield,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";

export function Sidebar() {
  const { logout, user } = useAuth();
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const data = await api.getAlertCount();
        setActiveAlertCount(data.active || 0);
      } catch (e) {}
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 6000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/devices", label: "Devices", icon: Server },
    { to: "/configuration", label: "Configuration", icon: Sliders },
    { to: "/changes", label: "Changes", icon: History },
    { to: "/compliance", label: "Compliance", icon: CheckSquare },
    { to: "/risk", label: "Risk Assessment", icon: ShieldAlert },
    { to: "/ai-analysis", label: "AI / ML Analysis", icon: Cpu },
    { to: "/alerts", label: "Alerts", icon: Bell, badge: activeAlertCount },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/settings", label: "Settings", icon: Settings }
  ];

  return (
    <aside style={{
      width: "260px",
      backgroundColor: "#09101f",
      borderRight: "1px solid var(--border-color)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      minHeight: "100vh"
    }}>
      {/* Brand Header */}
      <div style={{
        padding: "1.25rem 1.5rem",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #0284c7, #06b6d4)",
          color: "#fff",
          padding: "0.5rem",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 15px rgba(6, 182, 212, 0.4)"
        }}>
          <Shield size={22} />
        </div>
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>
            SecOps Auditor
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--accent-cyan)", fontWeight: 600 }}>
            SIH 2026 PROTOTYPE
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.65rem 0.85rem",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "#ffffff" : "var(--text-secondary)",
                backgroundColor: isActive ? "rgba(2, 132, 199, 0.2)" : "transparent",
                borderLeft: isActive ? "3px solid var(--accent-cyan)" : "3px solid transparent",
                transition: "all 0.15s ease"
              })}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span style={{
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.45rem",
                  borderRadius: "9999px"
                }}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div style={{
        padding: "1rem 1.25rem",
        borderTop: "1px solid var(--border-color)",
        backgroundColor: "#060b14",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
            {user?.name || "Admin Auditor"}
          </div>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
            {user?.email || "admin@example.com"}
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "0.35rem",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
