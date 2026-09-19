import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { Layout } from "./components/Layout.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { DevicesPage } from "./pages/DevicesPage.jsx";
import { DeviceDetailsPage } from "./pages/DeviceDetailsPage.jsx";
import { ConfigurationPage } from "./pages/ConfigurationPage.jsx";
import { ChangesPage } from "./pages/ChangesPage.jsx";
import { CompliancePage } from "./pages/CompliancePage.jsx";
import { RiskAssessmentPage } from "./pages/RiskAssessmentPage.jsx";
import { AiAnalysisPage } from "./pages/AiAnalysisPage.jsx";
import { AlertsPage } from "./pages/AlertsPage.jsx";
import { ReportsPage } from "./pages/ReportsPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#060a14", color: "#38bdf8" }}>
        Loading SecOps Workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="devices/:id" element={<DeviceDetailsPage />} />
        <Route path="configuration" element={<ConfigurationPage />} />
        <Route path="changes" element={<ChangesPage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="risk" element={<RiskAssessmentPage />} />
        <Route path="ai-analysis" element={<AiAnalysisPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
