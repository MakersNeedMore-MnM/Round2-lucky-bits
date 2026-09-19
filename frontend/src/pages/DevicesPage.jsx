import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Server,
  Search,
  Filter,
  Plus,
  Play,
  Eye,
  Sliders,
  CheckCircle,
  Activity,
  Layers,
  LayoutGrid,
  List
} from "lucide-react";
import { api } from "../services/api.js";
import { VendorBadge } from "../components/VendorBadge.jsx";
import { RiskBadge } from "../components/RiskBadge.jsx";

export function DevicesPage() {
  const { refreshKey, triggerRefresh } = useOutletContext();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const [auditingId, setAuditingId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New device form state
  const [newDevice, setNewDevice] = useState({
    name: "",
    vendor: "Cisco",
    model: "Catalyst 9300",
    device_type: "Switch",
    ip_address: "",
    location: "HQ Datacenter"
  });

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (vendorFilter !== "All") params.vendor = vendorFilter;
      if (riskFilter !== "All") params.risk_level = riskFilter;
      const data = await api.getDevices(params);
      setDevices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [search, vendorFilter, riskFilter, refreshKey]);

  const handleRunAudit = async (id) => {
    try {
      setAuditingId(id);
      await api.auditDevice(id);
      await fetchDevices();
      triggerRefresh();
    } catch (e) {
      alert(e.message);
    } finally {
      setAuditingId(null);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      await api.addDevice(newDevice);
      setIsAddModalOpen(false);
      setNewDevice({
        name: "",
        vendor: "Cisco",
        model: "Catalyst 9300",
        device_type: "Switch",
        ip_address: "",
        location: "HQ Datacenter"
      });
      await fetchDevices();
      triggerRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Top Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff" }}>
            Multi-Vendor Network Device Inventory
          </h2>
          <p style={{ fontSize: "0.825rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Real-time compliance monitoring across {devices.length} registered hardware nodes
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add Device
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="cyber-card" style={{ marginBottom: "1.25rem", padding: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
          {/* Search */}
          <div style={{ position: "relative", minWidth: "280px", flex: "1" }}>
            <Search size={16} style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: "2.4rem" }}
              placeholder="Search by device name, IP address, or model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>Vendor:</span>
              <select
                className="input-field"
                style={{ width: "auto", padding: "0.45rem 0.75rem", fontSize: "0.8rem" }}
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
              >
                <option value="All">All Vendors (4)</option>
                <option value="Cisco">Cisco</option>
                <option value="Fortinet">Fortinet</option>
                <option value="Palo Alto">Palo Alto</option>
                <option value="Juniper">Juniper</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>Risk:</span>
              <select
                className="input-field"
                style={{ width: "auto", padding: "0.45rem 0.75rem", fontSize: "0.8rem" }}
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="All">All Risk Tiers</option>
                <option value="Low">Low / Safe</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div style={{ display: "flex", border: "1px solid var(--border-color)", borderRadius: "6px", overflow: "hidden" }}>
              <button
                onClick={() => setViewMode("table")}
                style={{
                  background: viewMode === "table" ? "#1e293b" : "transparent",
                  border: "none",
                  padding: "0.4rem 0.6rem",
                  color: viewMode === "table" ? "var(--accent-cyan)" : "var(--text-muted)",
                  cursor: "pointer"
                }}
                title="Table View"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                style={{
                  background: viewMode === "grid" ? "#1e293b" : "transparent",
                  border: "none",
                  padding: "0.4rem 0.6rem",
                  color: viewMode === "grid" ? "var(--accent-cyan)" : "var(--text-muted)",
                  cursor: "pointer"
                }}
                title="Card Grid View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Devices List Table */}
      {viewMode === "table" ? (
        <div className="cyber-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="cyber-table-container" style={{ border: "none" }}>
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Device Name</th>
                  <th>Vendor</th>
                  <th>Device Type</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th>Last Checked</th>
                  <th>Risk Tier</th>
                  <th>Compliance</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                      No devices match the specified search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  devices.map((device) => (
                    <tr key={device.id}>
                      <td style={{ fontWeight: 600 }}>
                        <Link
                          to={`/devices/${device.id}`}
                          style={{ color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-cyan)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#fff")}
                        >
                          {device.name}
                        </Link>
                        <div style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>{device.model}</div>
                      </td>
                      <td>
                        <VendorBadge vendor={device.vendor} />
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{device.device_type}</td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#38bdf8" }}>
                        {device.ip_address}
                      </td>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "#34d399" }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981" }} />
                          {device.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {device.last_audit ? new Date(device.last_audit).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently"}
                      </td>
                      <td>
                        <RiskBadge level={device.risk_level} score={device.risk_score} />
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ width: "45px", height: "5px", background: "#1e293b", borderRadius: "9999px", overflow: "hidden" }}>
                            <div style={{
                              width: `${device.compliance_score || 0}%`,
                              height: "100%",
                              background: (device.compliance_score || 0) >= 80 ? "#10b981" : "#f59e0b"
                            }} />
                          </div>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.775rem", fontWeight: 600 }}>
                            {device.compliance_score || 0}%
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "0.35rem" }}>
                          <Link
                            to={`/devices/${device.id}`}
                            className="btn btn-secondary btn-sm"
                            title="View Detailed Telemetry & Diff"
                          >
                            <Eye size={13} /> Details
                          </Link>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleRunAudit(device.id)}
                            disabled={auditingId === device.id}
                            title="Run Real-time Audit"
                          >
                            <Play size={13} /> {auditingId === device.id ? "Auditing..." : "Audit"}
                          </button>
                          <Link
                            to={`/configuration?device=${device.id}`}
                            className="btn btn-secondary btn-sm"
                            title="View Configuration Diff"
                          >
                            <Sliders size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {devices.map((device) => (
            <div key={device.id} className="cyber-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
                      <Link to={`/devices/${device.id}`} style={{ color: "#fff", textDecoration: "none" }}>
                        {device.name}
                      </Link>
                    </h3>
                    <div style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
                      {device.model} • {device.device_type}
                    </div>
                  </div>
                  <VendorBadge vendor={device.vendor} />
                </div>

                <div style={{ background: "#0a1120", padding: "0.75rem", borderRadius: "6px", marginBottom: "0.75rem", fontSize: "0.775rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>IP Address:</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: "#38bdf8" }}>{device.ip_address}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Status:</span>
                    <span style={{ color: "#34d399", fontWeight: 500 }}>{device.status}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Location:</span>
                    <span style={{ color: "#e2e8f0" }}>{device.location}</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <RiskBadge level={device.risk_level} score={device.risk_score} />
                  <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Score: <span style={{ color: device.compliance_score >= 80 ? "#34d399" : "#fbbf24" }}>{device.compliance_score}%</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem" }}>
                <Link to={`/devices/${device.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                  <Eye size={14} /> View Details
                </Link>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleRunAudit(device.id)}
                  disabled={auditingId === device.id}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  <Play size={14} /> {auditingId === device.id ? "Auditing..." : "Audit"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Device Modal */}
      {isAddModalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div className="cyber-card" style={{ maxWidth: "500px", width: "100%", background: "#0c1527", padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem", color: "#fff" }}>
              Register Multi-Vendor Network Device
            </h3>
            <form onSubmit={handleAddDevice}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                    Device Hostname
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Cisco-Access-SW-03"
                    value={newDevice.name}
                    onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                      Vendor
                    </label>
                    <select
                      className="input-field"
                      value={newDevice.vendor}
                      onChange={(e) => setNewDevice({ ...newDevice, vendor: e.target.value })}
                    >
                      <option value="Cisco">Cisco</option>
                      <option value="Fortinet">Fortinet</option>
                      <option value="Palo Alto">Palo Alto</option>
                      <option value="Juniper">Juniper</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                      Device Type
                    </label>
                    <select
                      className="input-field"
                      value={newDevice.device_type}
                      onChange={(e) => setNewDevice({ ...newDevice, device_type: e.target.value })}
                    >
                      <option value="Router">Router</option>
                      <option value="Switch">Switch</option>
                      <option value="Firewall">Firewall</option>
                      <option value="Gateway">Gateway</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                      Hardware Model
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Catalyst 9300"
                      value={newDevice.model}
                      onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                      Management IP Address
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="192.168.1.55"
                      value={newDevice.ip_address}
                      onChange={(e) => setNewDevice({ ...newDevice, ip_address: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
                    Physical Enclave / Datacenter Location
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="HQ Floor 2 Rack 03"
                    value={newDevice.location}
                    onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Register & Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
