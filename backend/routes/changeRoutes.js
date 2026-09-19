import express from "express";
import db from "../data/database.js";
import { AuditService } from "../services/auditService.js";
import { AdapterFactory } from "../services/deviceAdapters.js";

const router = express.Router();

// GET changes with filters
router.get("/", (req, res) => {
  try {
    const { filter, search } = req.query;
    let sql = "SELECT * FROM configuration_changes WHERE 1=1";
    const params = [];

    if (search) {
      sql += " AND (device_name LIKE ? OR setting_name LIKE ? OR reason LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (filter === "authorized") {
      sql += " AND is_authorized = 1";
    } else if (filter === "unauthorized") {
      sql += " AND is_authorized = 0";
    } else if (filter === "high_risk") {
      sql += " AND (risk_level = 'High' OR risk_level = 'Critical')";
    } else if (filter === "critical") {
      sql += " AND risk_level = 'Critical'";
    }

    sql += " ORDER BY detected_at DESC";
    const changes = db.query(sql, params);
    res.json(changes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST simulate configuration change
router.post("/simulate", (req, res) => {
  try {
    let targetDeviceId = req.body.deviceId;
    let device;

    if (targetDeviceId) {
      device = db.get("SELECT * FROM devices WHERE id = ?", [targetDeviceId]);
    }

    // Default to Fortinet-Edge-FW if available or pick a safe device
    if (!device) {
      device = db.get("SELECT * FROM devices WHERE name = 'Fortinet-Edge-FW'");
      if (!device) {
        device = db.get("SELECT * FROM devices WHERE risk_level = 'Low' ORDER BY id ASC LIMIT 1");
      }
    }

    if (!device) {
      return res.status(404).json({ error: "No suitable device found to simulate change" });
    }

    // Fetch current config
    const currentConfigRow = db.get(
      "SELECT * FROM configurations WHERE device_id = ? AND is_current = 1 ORDER BY version DESC LIMIT 1",
      [device.id]
    );

    let currentConfig = currentConfigRow ? JSON.parse(currentConfigRow.config_json) : {};
    let nextVersion = (currentConfigRow ? currentConfigRow.version : 1) + 1;

    // Apply the drift scenario:
    // If Fortinet or safe device, disable logging and enable remote access
    const newConfig = { ...currentConfig };
    if (newConfig.logging === "Enabled") {
      newConfig.logging = "Disabled";
    } else {
      newConfig.logging = "Enabled";
    }

    if (newConfig.remote_access === "Disabled") {
      newConfig.remote_access = "Enabled";
    } else {
      newConfig.remote_access = "Disabled";
    }

    // Mark previous current config as historical (is_current = 0)
    db.run("UPDATE configurations SET is_current = 0 WHERE device_id = ?", [device.id]);

    const adapter = AdapterFactory.getAdapter(device.vendor);
    const rawConfig = adapter.generateRawConfig(device, newConfig);

    // Insert new config version as current
    db.run(
      `INSERT INTO configurations (device_id, version, config_json, raw_config, is_current, timestamp)
       VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [device.id, nextVersion, JSON.stringify(newConfig), rawConfig]
    );

    // Run audit to trigger full detection pipeline
    const auditResult = AuditService.auditDevice(device.id);

    res.json({
      message: `Simulated configuration change successfully applied to ${device.name}`,
      device: auditResult.device,
      detectedChanges: auditResult.detectedChanges,
      compliance: auditResult.compliance,
      riskAnalysis: auditResult.riskAnalysis
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
