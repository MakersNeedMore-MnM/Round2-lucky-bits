import db from "../data/database.js";
import { AdapterFactory } from "./deviceAdapters.js";
import { ChangeDetector } from "./changeDetector.js";
import { ComplianceEngine } from "./complianceEngine.js";
import { RiskAnalyzer } from "./riskAnalyzer.js";

export class AuditService {
  /**
   * Performs an end-to-end security compliance audit for a single device.
   */
  static auditDevice(deviceId) {
    const device = db.get("SELECT * FROM devices WHERE id = ?", [deviceId]);
    if (!device) throw new Error(`Device #${deviceId} not found`);

    // 1. Get current and previous configuration
    const configs = db.query(
      "SELECT * FROM configurations WHERE device_id = ? ORDER BY version DESC LIMIT 2",
      [deviceId]
    );

    const currentConfigRow = configs.find(c => c.is_current === 1) || configs[0];
    const prevConfigRow = configs.find(c => c.is_current === 0) || configs[1] || currentConfigRow;

    const currentConfig = JSON.parse(currentConfigRow.config_json);
    const prevConfig = JSON.parse(prevConfigRow.config_json);

    // 2. Change Detection
    const detectedChanges = ChangeDetector.detectChanges(
      device.id,
      device.name,
      prevConfig,
      currentConfig,
      false
    );

    // Save newly detected changes if not already logged
    for (const change of detectedChanges) {
      const existing = db.get(
        `SELECT id FROM configuration_changes 
         WHERE device_id = ? AND setting_name = ? AND previous_value = ? AND current_value = ? 
         AND detected_at > datetime('now', '-10 minutes')`,
        [change.device_id, change.setting_name, change.previous_value, change.current_value]
      );

      if (!existing) {
        db.run(
          `INSERT INTO configuration_changes 
           (device_id, device_name, setting_name, previous_value, current_value, change_type, risk_level, reason, recommendation, is_authorized) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            change.device_id,
            change.device_name,
            change.setting_name,
            change.previous_value,
            change.current_value,
            change.change_type,
            change.risk_level,
            change.reason,
            change.recommendation,
            change.is_authorized
          ]
        );
      }
    }

    // 3. Security & Compliance Engine Check
    const complianceEval = ComplianceEngine.evaluate(currentConfig);

    // Record compliance results in DB
    db.run("DELETE FROM compliance_results WHERE device_id = ?", [deviceId]);
    for (const res of complianceEval.results) {
      db.run(
        `INSERT INTO compliance_results (device_id, rule_id, status, details) VALUES (?, ?, ?, ?)`,
        [deviceId, res.rule_id, res.status, res.details]
      );
    }

    // 4. AI / ML Risk Assessment Layer
    const recentChanges = db.query(
      "SELECT * FROM configuration_changes WHERE device_id = ? ORDER BY detected_at DESC LIMIT 5",
      [deviceId]
    );

    const riskAnalysis = RiskAnalyzer.analyze(
      device,
      currentConfig,
      complianceEval,
      recentChanges
    );

    // Save risk assessment
    db.run(
      `INSERT INTO risk_assessments 
       (device_id, risk_score, risk_level, features_json, detected_problems_json, recommendations_json) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        deviceId,
        riskAnalysis.riskScore,
        riskAnalysis.riskLevel,
        JSON.stringify(riskAnalysis.features),
        JSON.stringify(riskAnalysis.detectedProblems),
        JSON.stringify(riskAnalysis.recommendations)
      ]
    );

    // 5. Update Device Status & Metrics
    db.run(
      `UPDATE devices 
       SET compliance_score = ?, risk_level = ?, risk_score = ?, last_audit = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [complianceEval.complianceScore, riskAnalysis.riskLevel, riskAnalysis.riskScore, deviceId]
    );

    // 6. Alert Generation
    if (riskAnalysis.riskLevel === "Critical" || riskAnalysis.riskLevel === "High") {
      const alertTitle = detectedChanges.length > 0 
        ? `Unauthorized configuration change detected on ${device.name}`
        : `Elevated security risk score (${riskAnalysis.riskScore}/100) on ${device.name}`;

      const alertMsg = riskAnalysis.detectedProblems.map(p => p.problem).join(" ") ||
        `Device ${device.name} failed compliance checks. Risk level is ${riskAnalysis.riskLevel}.`;

      // Prevent duplicate unacknowledged alerts within recent timeframe
      const existingAlert = db.get(
        `SELECT id FROM alerts WHERE device_id = ? AND status = 'Active' AND title = ?`,
        [deviceId, alertTitle]
      );

      if (!existingAlert) {
        db.run(
          `INSERT INTO alerts (device_id, device_name, severity, title, message, status) 
           VALUES (?, ?, ?, ?, ?, 'Active')`,
          [deviceId, device.name, riskAnalysis.riskLevel, alertTitle, alertMsg]
        );
      }
    }

    const updatedDevice = db.get("SELECT * FROM devices WHERE id = ?", [deviceId]);

    return {
      device: updatedDevice,
      compliance: complianceEval,
      riskAnalysis,
      detectedChanges,
      currentConfig,
      prevConfig
    };
  }

  /**
   * Runs an end-to-end audit on all devices.
   */
  static auditAll() {
    const devices = db.query("SELECT id FROM devices");
    const results = [];

    for (const d of devices) {
      results.push(this.auditDevice(d.id));
    }

    return results;
  }
}
