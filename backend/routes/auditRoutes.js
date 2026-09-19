import express from "express";
import { AuditService } from "../services/auditService.js";
import db from "../data/database.js";

const router = express.Router();

// POST run full network audit across all devices
router.post("/run", (req, res) => {
  try {
    const auditResults = AuditService.auditAll();

    const totalDevices = auditResults.length;
    const avgCompliance = Math.round(
      auditResults.reduce((acc, curr) => acc + (curr.compliance?.complianceScore || 0), 0) / (totalDevices || 1)
    );

    const riskBreakdown = {
      Low: auditResults.filter(r => r.riskAnalysis.riskLevel === "Low").length,
      Medium: auditResults.filter(r => r.riskAnalysis.riskLevel === "Medium").length,
      High: auditResults.filter(r => r.riskAnalysis.riskLevel === "High").length,
      Critical: auditResults.filter(r => r.riskAnalysis.riskLevel === "Critical").length
    };

    res.json({
      message: "Full network compliance audit completed successfully",
      auditSummary: {
        total_devices: totalDevices,
        overall_compliance: avgCompliance,
        safe_devices: riskBreakdown.Low,
        warning_devices: riskBreakdown.Medium,
        high_risk_devices: riskBreakdown.High,
        critical_devices: riskBreakdown.Critical,
        timestamp: new Date().toISOString()
      },
      auditSteps: [
        "1. Collecting data from Cisco, Fortinet, Palo Alto, Juniper...",
        "2. Checking configurations & validating syntax...",
        "3. Detecting configuration drift & changes...",
        "4. Analyzing risks via AI/ML multi-factor engine...",
        "5. Checking CIS / NIST compliance rules...",
        "6. Generating plain-English recommendations & remediation CLI...",
        "7. Audit completed."
      ],
      resultsCount: auditResults.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
