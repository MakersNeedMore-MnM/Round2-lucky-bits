const BASE_URL = "http://localhost:5000/api";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.statusText}`;
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  getMe: () => request("/auth/me"),

  // Dashboard
  getDashboard: () => request("/dashboard"),

  // Devices
  getDevices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/devices${query ? `?${query}` : ""}`);
  },
  getDeviceById: (id) => request(`/devices/${id}`),
  addDevice: (data) => request("/devices", { method: "POST", body: JSON.stringify(data) }),
  auditDevice: (id) => request(`/devices/${id}/audit`, { method: "POST" }),

  // Configuration
  getDeviceConfig: (id) => request(`/devices/${id}/configuration`),
  getConfigurations: () => request("/configurations"),

  // Changes
  getChanges: (filter = "", search = "") => {
    const params = new URLSearchParams();
    if (filter) params.append("filter", filter);
    if (search) params.append("search", search);
    return request(`/changes?${params.toString()}`);
  },
  simulateChange: (deviceId = null) => request("/changes/simulate", { method: "POST", body: JSON.stringify({ deviceId }) }),

  // Compliance
  getCompliance: () => request("/compliance"),
  getRuleDetails: (id) => request(`/compliance/rules/${id}`),

  // AI & Risk
  getRiskOverview: () => request("/risk"),
  getRiskAssessments: () => request("/risk/assessments"),
  simulateRiskSandbox: (data) => request("/risk/simulate", { method: "POST", body: JSON.stringify(data) }),

  // Alerts
  getAlerts: (status = "", severity = "") => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (severity) params.append("severity", severity);
    return request(`/alerts?${params.toString()}`);
  },
  getAlertCount: () => request("/alerts/count"),
  acknowledgeAlert: (id) => request(`/alerts/${id}/acknowledge`, { method: "PATCH" }),
  resolveAlert: (id) => request(`/alerts/${id}/resolve`, { method: "PATCH" }),

  // Full Network Audit
  runFullAudit: () => request("/audit/run", { method: "POST" }),

  // Reports
  getReports: () => request("/reports"),
  generateReport: (title = "", generatedBy = "") => request("/reports/generate", { method: "POST", body: JSON.stringify({ title, generated_by: generatedBy }) }),

  // Demo Controls
  resetDemo: () => request("/demo/reset", { method: "POST" }),
  runFortinetScenario: () => request("/demo/scenario-fortinet", { method: "POST" }),
  generateRandomIssue: () => request("/demo/generate-issue", { method: "POST" })
};
