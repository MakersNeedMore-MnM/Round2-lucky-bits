import React, { useState, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { Sliders, Server, AlertTriangle, ShieldAlert, CheckCircle, ArrowRight, FileCode, RefreshCw } from "lucide-react";
import { api } from "../services/api.js";
import { VendorBadge } from "../components/VendorBadge.jsx";
import { RiskBadge } from "../components/RiskBadge.jsx";
import { ConfigDiffViewer } from "../components/ConfigDiffViewer.jsx";

export function ConfigurationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshKey } = useOutletContext();
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(searchParams.get("device") || "");
  const [configData, setConfigData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all devices for dropdown
  useEffect(() => {
    const fetchDevicesList = async () => {
      try {
        const list = await api.getDevices();
        setDevices(list);
        if (!selectedDeviceId && list.length > 0) {
          // Default to Fortinet-Edge-FW or first device
          const fortinet = list.find(d => d.name === "Fortinet-Edge-FW");
          setSelectedDeviceId(fortinet ? fortinet.id : list[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDevicesList();
  }, [refreshKey]);

  // Fetch config details for selected device
  useEffect(() => {
    if (!selectedDeviceId) return;
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await api.getDeviceConfig(selectedDeviceId);
        setConfigData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [selectedDeviceId, refreshKey]);

  const handleDeviceChange = (e) => {
    const id = e.target.value;
    setSelectedDeviceId(id);
    setSearchParams({ device: id });
  };

  const selectedDevice = devices.find(d => String(d.id) === String(selectedDeviceId));

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
            Configuration Monitoring & Drift Analysis
          </h2>
          <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Continuous diffing between current running state and baseline repository
          </p>
        </div>

        {/* Device Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Select Node:</span>
          <select
            className="input-field"
            style={{ width: "260px" }}
            value={selectedDeviceId}
            onChange={handleDeviceChange}
          >
            {devices.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.vendor})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && !configData ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p style={{ color: "var(--text-secondary)" }}>Fetching active configuration diffs...</p>
        </div>
      ) : !configData ? (
        <div className="cyber-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p style={{ color: "var(--text-secondary)" }}>Select a device to review its configuration profile.</p>
        </div>
      ) : (
        <>
          {/* Active Device Context Card */}
          <div className="cyber-card" style={{ marginBottom: "1.25rem", background: "#0a1324" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "var(--accent-cyan)",
                  padding: "0.75rem",
                  borderRadius: "10px"
                }}>
                  <Server size={24} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{configData.device.name}</h3>
                    <VendorBadge vendor={configData.device.vendor} />
                    <RiskBadge level={configData.device.risk_level} score={configData.device.risk_score} />
                  </div>
                  <div style={{ fontSize: "0.775rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                    IP: <span style={{ fontFamily: "var(--font-mono)", color: "#38bdf8" }}>{configData.device.ip_address}</span> •
                    Model: {configData.device.model} •
                    Current Snapshot Version: v{configData.currentVersion} •
                    Previous Baseline: v{configData.previousVersion}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{
                  background: configData.diffs.length > 0 ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                  color: configData.diffs.length > 0 ? "#f87171" : "#34d399",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "6px",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem"
                }}>
                  {configData.diffs.length > 0 ? (
                    <>
                      <AlertTriangle size={14} /> {configData.diffs.length} Drift Parameter(s) Detected
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} /> In Sync with Baseline (0 Drift)
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Configuration Change Detected Callout Banner (Prompt Required Example) */}
          {configData.diffs.length > 0 && (
            <div style={{
              background: "#180f1d",
              border: "1px solid #7f1d1d",
              borderRadius: "10px",
              padding: "1.25rem",
              marginBottom: "1.5rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f87171", fontWeight: 700, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                <ShieldAlert size={18} /> Configuration Change Detected
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {configData.diffs.map((diff, index) => (
                  <div key={index} style={{ background: "#0a0a14", border: "1px solid #2d1829", borderRadius: "8px", padding: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: "1rem", marginBottom: "0.75rem", fontSize: "0.85rem" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Device:</span>
                        <div style={{ fontWeight: 600, color: "#fff" }}>{diff.device_name}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Changed setting:</span>
                        <div style={{ fontWeight: 600, color: "var(--accent-cyan)" }}>{diff.setting_name}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Previous:</span>
                        <div style={{ color: "#94a3b8" }}>{diff.previous_value}</div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Current:</span>
                        <div style={{ color: "#f87171", fontWeight: 700 }}>{diff.current_value}</div>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem", borderTop: "1px solid #1e1e2e", paddingTop: "0.75rem", fontSize: "0.8rem" }}>
                      <div>
                        <span style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>Status:</span>
                        <div>
                          <RiskBadge level={diff.risk_level} />
                        </div>
                      </div>
                      <div>
                        <div style={{ marginBottom: "0.35rem" }}>
                          <strong style={{ color: "#fca5a5" }}>Reason:</strong> {diff.reason}
                        </div>
                        <div>
                          <strong style={{ color: "#93c5fd" }}>Recommendation:</strong> {diff.recommendation}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ConfigDiffViewer with Structured & Raw Views */}
          <ConfigDiffViewer
            previousConfig={configData.previousConfig}
            currentConfig={configData.currentConfig}
            previousRaw={configData.previousRaw}
            currentRaw={configData.currentRaw}
          />
        </>
      )}
    </div>
  );
}
