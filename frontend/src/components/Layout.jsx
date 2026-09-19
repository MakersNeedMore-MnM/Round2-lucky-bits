import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { Header } from "./Header.jsx";
import { DemoControlBar } from "./DemoControlBar.jsx";
import { AuditProgressModal } from "./AuditProgressModal.jsx";
import { api } from "../services/api.js";

export function Layout() {
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleStartAudit = async () => {
    setIsAuditModalOpen(true);
    try {
      await api.runFullAudit();
    } catch (e) {
      console.error("Audit error:", e);
    }
  };

  const handleAuditComplete = () => {
    triggerRefresh();
  };

  return (
    <div className="app-container">
      <Sidebar key={`sidebar-${refreshKey}`} />
      <div className="main-content">
        <Header onAuditClick={handleStartAudit} key={`header-${refreshKey}`} />
        <main className="page-container">
          <DemoControlBar
            onAuditClick={handleStartAudit}
            onStateChange={triggerRefresh}
          />
          <Outlet context={{ refreshKey, triggerRefresh }} />
        </main>
      </div>

      <AuditProgressModal
        isOpen={isAuditModalOpen}
        onClose={() => {
          setIsAuditModalOpen(false);
          triggerRefresh();
        }}
        onComplete={handleAuditComplete}
      />
    </div>
  );
}
