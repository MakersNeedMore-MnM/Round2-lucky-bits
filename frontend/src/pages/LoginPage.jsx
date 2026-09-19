import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail("admin@example.com");
    setPassword("Admin@123");
    setError("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#060a14",
      backgroundImage: "radial-gradient(ellipse at top, #0f2744 0%, #060a14 70%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem"
    }}>
      <div style={{
        maxWidth: "460px",
        width: "100%",
        background: "#0c1527",
        border: "1px solid #1e3357",
        borderRadius: "16px",
        padding: "2.5rem 2rem",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.15)"
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "60px",
            height: "60px",
            borderRadius: "14px",
            background: "linear-gradient(135deg, #0284c7, #06b6d4)",
            color: "#fff",
            boxShadow: "0 0 25px rgba(6, 182, 212, 0.5)",
            marginBottom: "1rem"
          }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>
            Network Security Auditor
          </h2>
          <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.35rem" }}>
            Smart India Hackathon 2026 Prototype
          </p>
          <div style={{
            display: "inline-block",
            marginTop: "0.5rem",
            background: "rgba(56, 189, 248, 0.1)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
            color: "var(--accent-cyan)",
            fontSize: "0.7rem",
            fontWeight: 600,
            padding: "0.2rem 0.6rem",
            borderRadius: "9999px"
          }}>
            Multi-Vendor • Cisco • Fortinet • Palo Alto • Juniper
          </div>
        </div>

        {error && (
          <div style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            padding: "0.75rem",
            borderRadius: "8px",
            fontSize: "0.825rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.25rem"
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 500 }}>
              Administrator Email
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={17} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: "2.5rem" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem", fontWeight: 500 }}>
              Access Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={17} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: "2.5rem" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.95rem" }}
          >
            {loading ? "Verifying Credentials..." : "Authenticate SecOps Login"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Demo Credentials Helper Box */}
        <div style={{
          marginTop: "1.75rem",
          padding: "1rem",
          background: "#080f1e",
          border: "1px dashed #1e3357",
          borderRadius: "10px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <CheckCircle2 size={13} /> Demo Account Credentials:
            </span>
            <button
              type="button"
              onClick={fillDemo}
              style={{ background: "none", border: "none", color: "#38bdf8", fontSize: "0.725rem", cursor: "pointer", textDecoration: "underline" }}
            >
              Fill Credentials
            </button>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            Email: <span style={{ color: "#e2e8f0" }}>admin@example.com</span><br />
            Password: <span style={{ color: "#e2e8f0" }}>Admin@123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
