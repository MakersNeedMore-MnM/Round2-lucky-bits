import express from "express";
import db from "../data/database.js";
import { AuditService } from "../services/auditService.js";
import { AdapterFactory } from "../services/deviceAdapters.js";

const router = express.Router();

// GET all devices with filtering
router.get("/", (req, res) => {
  try {
    const { search, vendor, risk_level, device_type } = req.query;
    let sql = "SELECT * FROM devices WHERE 1=1";
    const params = [];

    if (search) {
      sql += " AND (name LIKE ? OR ip_address LIKE ? OR model LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (vendor && vendor !== "All") {
      sql += " AND vendor = ?";
      params.push(vendor);
    }
    if (risk_level && risk_level !== "All") {
      sql += " AND risk_level = ?";
      params.push(risk_level);
    }
    if (device_type && device_type !== "All") {
      sql += " AND device_type = ?";
      params.push(device_type);
    }

    sql += " ORDER BY id ASC";
    const devices = db.query(sql, params);
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET device by ID with detailed configuration and telemetry
router.get("/:id", (req, res) => {
  try {
    const deviceId = req.params.id;
    const device = db.get("SELECT * FROM devices WHERE id = ?", [deviceId]);
    if (!device) return res.status(404).json({ error: "Device not found" });

    // Configurations
    const configs = db.query(
      "SELECT * FROM configurations WHERE device_id = ? ORDER BY version DESC",
      [deviceId]
    );

    const currentConfigRow = configs.find(c => c.is_current === 1) || configs[0] || null;
    const previousConfigRow = configs.find(c => c.is_current === 0) || configs[1] || currentConfigRow;

    const currentConfig = currentConfigRow ? JSON.parse(currentConfigRow.config_json) : {};
    const previousConfig = previousConfigRow ? JSON.parse(previousConfigRow.config_json) : {};

    // Compliance results with rule metadata
    const complianceResults = db.query(`
      SELECT cr.id, cr.rule_id, cr.status, cr.details, cr.checked_at,
             r.name as rule_name, r.category, r.severity, r.remediation_hint
      FROM compliance_results cr
      JOIN compliance_rules r ON cr.rule_id = r.rule_id
      WHERE cr.device_id = ?
      ORDER BY r.rule_id ASC
    `, [deviceId]);

    // Latest Risk Assessment
    const latestRiskRow = db.get(
      "SELECT * FROM risk_assessments WHERE device_id = ? ORDER BY assessed_at DESC LIMIT 1",
      [deviceId]
    );
    let riskAssessment = null;
    if (latestRiskRow) {
      riskAssessment = {
        ...latestRiskRow,
        features: JSON.parse(latestRiskRow.features_json),
        detected_problems: JSON.parse(latestRiskRow.detected_problems_json),
        recommendations: JSON.parse(latestRiskRow.recommendations_json)
      };
    }

    // Change History
    const changes = db.query(
      "SELECT * FROM configuration_changes WHERE device_id = ? ORDER BY detected_at DESC",
      [deviceId]
    );

    res.json({
      device,
      currentConfigRow,
      previousConfigRow,
      currentConfig,
      previousConfig,
      complianceResults,
      riskAssessment,
      changes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run audit on specific device
router.post("/:id/audit", (req, res) => {
  try {
    const result = AuditService.auditDevice(req.params.id);
    res.json({ message: "Audit completed successfully", ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new device
router.post("/", (req, res) => {
  try {
    const { name, vendor, model, device_type, ip_address, location } = req.body;
    if (!name || !vendor || !model || !ip_address) {
      return res.status(400).json({ error: "Name, vendor, model, and IP are required" });
    }

    const existing = db.get("SELECT id FROM devices WHERE name = ? OR ip_address = ?", [name, ip_address]);
    if (existing) {
      return res.status(400).json({ error: "A device with this name or IP address already exists" });
    }

    const resDevice = db.run(
      `INSERT INTO devices (name, vendor, model, device_type, ip_address, location, last_audit)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [name, vendor, model, device_type || "Router", ip_address, location || "HQ Datacenter"]
    );

    const deviceId = resDevice.lastInsertRowid;

    // Baseline config
    const defaultConfig = {
      logging: "Enabled",
      remote_access: "Disabled",
      password_policy: "Strong",
      default_deny: true,
      snmp_version: "v3",
      http_web_access: false,
      ntp_configured: true,
      session_timeout: 10
    };

    const adapter = AdapterFactory.getAdapter(vendor);
    const rawConfig = adapter.generateRawConfig({ name, model, ip_address }, defaultConfig);

    db.run(
      `INSERT INTO configurations (device_id, version, config_json, raw_config, is_current)
       VALUES (?, 1, ?, ?, 1)`,
      [deviceId, JSON.stringify(defaultConfig), rawConfig]
    );

    const auditResult = AuditService.auditDevice(deviceId);

    res.status(201).json({
      message: "Device added and audited successfully",
      device: auditResult.device
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
