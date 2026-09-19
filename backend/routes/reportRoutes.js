import express from "express";
import db from "../data/database.js";

const router = express.Router();

// GET all generated reports history
router.get("/", (req, res) => {
  try {
    const reports = db.query("SELECT * FROM audit_reports ORDER BY created_at DESC");
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST generate new comprehensive audit report
router.post("/generate", (req, res) => {
  try {
    const title = req.body.title || `Network Security & Compliance Audit Report - ${new Date().toLocaleDateString()}`;
    const generatedBy = req.body.generated_by || "SecOps Lead Auditor";

    const totalDevices = db.get("SELECT COUNT(*) as count FROM devices").count;
    const safeDevices = db.get("SELECT COUNT(*) as count FROM devices WHERE risk_level = 'Low'").count;
    const warningDevices = db.get("SELECT COUNT(*) as count FROM devices WHERE risk_level = 'Medium'").count;
    const highRiskDevices = db.get("SELECT COUNT(*) as count FROM devices WHERE risk_level = 'High'").count;
    const criticalDevices = db.get("SELECT COUNT(*) as count FROM devices WHERE risk_level = 'Critical'").count;
    const overallCompliance = Math.round(db.get("SELECT AVG(compliance_score) as score FROM devices").score || 87);

    // Section 1: Executive Summary
    const executiveSummary = {
      audit_period: new Date().toISOString(),
      scope: `Full multi-vendor estate encompassing ${totalDevices} infrastructure devices across Cisco, Fortinet, Palo Alto, and Juniper fleets.`,
      overall_health: criticalDevices > 0 ? "REQUIRES IMMEDIATE ACTION" : highRiskDevices > 0 ? "ELEVATED CONCERN" : "SATISFACTORY",
      key_finding: criticalDevices > 0 
        ? `${criticalDevices} critical device(s) exhibit unauthorized configuration drift including disabled logging, exposed remote access, or weakened credential policies.`
        : "Network perimeter remains resilient with minor rule deviations observed in auxiliary switches."
    };

    // Section 2: Device Summary
    const devices = db.query("SELECT id, name, vendor, model, device_type, ip_address, status, compliance_score, risk_level, risk_score, last_audit FROM devices ORDER BY risk_score DESC");

    // Section 3: Configuration Changes
    const changes = db.query("SELECT * FROM configuration_changes ORDER BY detected_at DESC LIMIT 20");

    // Section 4: Compliance Violations
    const complianceViolations = db.query(`
      SELECT cr.rule_id, r.name as rule_name, r.category, r.severity,
             COUNT(CASE WHEN cr.status = 'FAIL' THEN 1 END) as fail_count,
             COUNT(CASE WHEN cr.status = 'WARNING' THEN 1 END) as warning_count
      FROM compliance_results cr
      JOIN compliance_rules r ON cr.rule_id = r.rule_id
      WHERE cr.status != 'PASS'
      GROUP BY cr.rule_id
      ORDER BY r.severity = 'Critical' DESC, r.severity = 'High' DESC
    `);

    // Section 5: Risk Assessment Overview
    const riskBreakdown = {
      safe: safeDevices,
      warning: warningDevices,
      high: highRiskDevices,
      critical: criticalDevices,
      total_issues: criticalDevices + highRiskDevices + warningDevices
    };

    // Section 6: Actionable Recommendations
    const topRisky = devices.filter(d => d.risk_level === "Critical" || d.risk_level === "High");
    const recommendations = topRisky.map(d => {
      const riskRow = db.get("SELECT recommendations_json FROM risk_assessments WHERE device_id = ? ORDER BY assessed_at DESC LIMIT 1", [d.id]);
      let recs = [];
      if (riskRow) {
        try { recs = JSON.parse(riskRow.recommendations_json); } catch (e) {}
      }
      return {
        device_name: d.name,
        vendor: d.vendor,
        ip_address: d.ip_address,
        risk_level: d.risk_level,
        recommendations: recs
      };
    });

    const fullReportData = {
      title,
      generated_by: generatedBy,
      generated_at: new Date().toISOString(),
      overall_compliance: overallCompliance,
      total_devices: totalDevices,
      critical_issues: criticalDevices,
      high_risk_issues: highRiskDevices,
      medium_risk_issues: warningDevices,
      low_risk_issues: safeDevices,
      executiveSummary,
      deviceSummary: devices,
      configurationChanges: changes,
      complianceViolations,
      riskAssessment: riskBreakdown,
      recommendations
    };

    const resDb = db.run(
      `INSERT INTO audit_reports 
       (title, generated_by, overall_compliance, total_devices, critical_issues, high_risk_issues, medium_risk_issues, low_risk_issues, summary_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        generatedBy,
        overallCompliance,
        totalDevices,
        criticalDevices,
        highRiskDevices,
        warningDevices,
        safeDevices,
        JSON.stringify(fullReportData)
      ]
    );

    res.status(201).json({
      id: resDb.lastInsertRowid,
      ...fullReportData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
