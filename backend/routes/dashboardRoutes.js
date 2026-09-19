import express from "express";
import db from "../data/database.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const totalDevices = db.get("SELECT COUNT(*) as count FROM devices").count;
    
    // Risk counts
    const safeDevices = db.get("SELECT COUNT(*) as count FROM devices WHERE risk_level = 'Low'").count;
    const warningDevices = db.get("SELECT COUNT(*) as count FROM devices WHERE risk_level = 'Medium'").count;
    const highRiskDevices = db.get("SELECT COUNT(*) as count FROM devices WHERE risk_level = 'High'").count;
    const criticalDevices = db.get("SELECT COUNT(*) as count FROM devices WHERE risk_level = 'Critical'").count;

    // Overall compliance
    const avgScore = db.get("SELECT AVG(compliance_score) as avg_score FROM devices").avg_score || 87;
    const overallCompliance = Math.round(avgScore);

    // 1. Risk Distribution Chart
    const riskDistribution = [
      { name: "Low", value: safeDevices, color: "#10b981" },
      { name: "Medium", value: warningDevices, color: "#f59e0b" },
      { name: "High", value: highRiskDevices, color: "#f97316" },
      { name: "Critical", value: criticalDevices, color: "#ef4444" }
    ];

    // 2. Vendor Distribution Chart
    const vendorRows = db.query("SELECT vendor, COUNT(*) as count FROM devices GROUP BY vendor ORDER BY count DESC");
    const vendorDistribution = vendorRows.map(row => ({
      vendor: row.vendor,
      count: row.count
    }));

    // 3. Configuration Changes over time (Simulated chronological trend)
    const changesTimeline = [
      { time: "06:00", changes: 0 },
      { time: "08:00", changes: 1 },
      { time: "10:00", changes: 2 },
      { time: "12:00", changes: 1 },
      { time: "14:00", changes: 3 },
      { time: "Now", changes: db.get("SELECT COUNT(*) as count FROM configuration_changes").count }
    ];

    // 4. Compliance Framework Distribution
    const complianceBreakdown = [
      { category: "Access Control", score: 84 },
      { category: "Logging & Auditing", score: 89 },
      { category: "Network Security", score: 82 },
      { category: "Encryption", score: 91 },
      { category: "System Integrity", score: 94 }
    ];

    // Top 5 Recent Changes
    const recentChanges = db.query(`
      SELECT * FROM configuration_changes 
      ORDER BY detected_at DESC LIMIT 5
    `);

    // Top 5 Active Alerts
    const recentAlerts = db.query(`
      SELECT a.*, d.vendor, d.model 
      FROM alerts a 
      LEFT JOIN devices d ON a.device_id = d.id 
      WHERE a.status = 'Active' 
      ORDER BY CASE a.severity WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, a.created_at DESC 
      LIMIT 5
    `);

    res.json({
      summary: {
        total_devices: totalDevices,
        safe_devices: safeDevices,
        warning_devices: warningDevices,
        high_risk_devices: highRiskDevices,
        critical_issues: criticalDevices,
        overall_compliance: overallCompliance
      },
      charts: {
        riskDistribution,
        vendorDistribution,
        changesTimeline,
        complianceBreakdown,
        overallCompliance
      },
      recentChanges,
      recentAlerts
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
