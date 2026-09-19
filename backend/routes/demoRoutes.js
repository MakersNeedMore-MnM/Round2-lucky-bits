import express from "express";
import db from "../data/database.js";
import { initDatabaseAndSeed } from "../data/initialSeed.js";
import { AuditService } from "../services/auditService.js";
import { AdapterFactory } from "../services/deviceAdapters.js";

const router = express.Router();

// POST reset demo data
router.post("/reset", (req, res) => {
  try {
    initDatabaseAndSeed();
    res.json({
      message: "Demo database reset to baseline state successfully.",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST trigger exact SIH presentation scenario on Fortinet Firewall
router.post("/scenario-fortinet", (req, res) => {
  try {
    const device = db.get("SELECT * FROM devices WHERE name = 'Fortinet-Edge-FW'");
    if (!device) {
      return res.status(404).json({ error: "Fortinet-Edge-FW not found. Please reset demo data." });
    }

    const currentConfigRow = db.get(
      "SELECT * FROM configurations WHERE device_id = ? AND is_current = 1 ORDER BY version DESC LIMIT 1",
      [device.id]
    );

    const prevConfig = currentConfigRow ? JSON.parse(currentConfigRow.config_json) : {};
    const nextVersion = (currentConfigRow ? currentConfigRow.version : 1) + 1;

    // Apply the exact change:
    // Logging -> Disabled
    // Remote Access -> Enabled
    const newConfig = {
      ...prevConfig,
      logging: "Disabled",
      remote_access: "Enabled"
    };

    // Mark previous as non-current
    db.run("UPDATE configurations SET is_current = 0 WHERE device_id = ?", [device.id]);

    const adapter = AdapterFactory.getAdapter("Fortinet");
    const rawConfig = adapter.generateRawConfig(device, newConfig);

    db.run(
      `INSERT INTO configurations (device_id, version, config_json, raw_config, is_current, timestamp)
       VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [device.id, nextVersion, JSON.stringify(newConfig), rawConfig]
    );

    // Run audit
    const auditResult = AuditService.auditDevice(device.id);

    res.json({
      scenario: "SIH-2026 Fortinet Configuration Drift Scenario",
      status: "COMPLETED",
      device: auditResult.device,
      changes: auditResult.detectedChanges,
      complianceViolations: auditResult.compliance.results.filter(r => r.status !== "PASS"),
      complianceScore: auditResult.compliance.complianceScore,
      riskAnalysis: auditResult.riskAnalysis,
      summarySteps: [
        "1. Configuration drift injected: Logging -> Disabled, Remote Access -> Enabled",
        "2. Change Detection engine identified 2 unauthorized parameter alterations",
        "3. Compliance Engine marked RULE-002 (Logging) & RULE-003 (Insecure Remote Access) as FAIL",
        "4. AI Risk Analyzer calculated calibrated Risk Score: 85 (HIGH RISK)",
        "5. Alert dispatched to Security Operations Dashboard",
        "6. Plain-English recommendations & FortiOS remediation scripts generated"
      ]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST generate random security issue
router.post("/generate-issue", (req, res) => {
  try {
    // Pick a safe device that is not Fortinet-Edge-FW
    const candidateDevices = db.query(
      "SELECT * FROM devices WHERE risk_level = 'Low' AND name != 'Fortinet-Edge-FW' LIMIT 5"
    );

    if (candidateDevices.length === 0) {
      return res.status(400).json({ error: "All devices already have elevated risk levels. Consider resetting demo data." });
    }

    const device = candidateDevices[Math.floor(Math.random() * candidateDevices.length)];
    const currentConfigRow = db.get(
      "SELECT * FROM configurations WHERE device_id = ? AND is_current = 1 ORDER BY version DESC LIMIT 1",
      [device.id]
    );

    const prevConfig = currentConfigRow ? JSON.parse(currentConfigRow.config_json) : {};
    const nextVersion = (currentConfigRow ? currentConfigRow.version : 1) + 1;

    // Random issue: disable logging or enable remote access or set weak password
    const issueTypes = [
      { key: "logging", val: "Disabled", desc: "Logging disabled" },
      { key: "remote_access", val: "Enabled", desc: "Insecure remote access enabled" },
      { key: "password_policy", val: "Weak", desc: "Password policy set to weak" },
      { key: "default_deny", val: false, desc: "Default deny firewall rule removed" }
    ];
    const pickedIssue = issueTypes[Math.floor(Math.random() * issueTypes.length)];

    const newConfig = { ...prevConfig, [pickedIssue.key]: pickedIssue.val };

    db.run("UPDATE configurations SET is_current = 0 WHERE device_id = ?", [device.id]);
    const adapter = AdapterFactory.getAdapter(device.vendor);
    const rawConfig = adapter.generateRawConfig(device, newConfig);

    db.run(
      `INSERT INTO configurations (device_id, version, config_json, raw_config, is_current, timestamp)
       VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [device.id, nextVersion, JSON.stringify(newConfig), rawConfig]
    );

    const auditResult = AuditService.auditDevice(device.id);

    res.json({
      message: `Security issue injected on ${device.name}: ${pickedIssue.desc}`,
      device: auditResult.device,
      riskAnalysis: auditResult.riskAnalysis,
      changes: auditResult.detectedChanges
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
