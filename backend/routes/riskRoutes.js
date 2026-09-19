import express from "express";
import db from "../data/database.js";
import { RiskAnalyzer } from "../services/riskAnalyzer.js";

const router = express.Router();

// GET risk overview and model architecture metrics
router.get("/", (req, res) => {
  try {
    const devices = db.query("SELECT id, name, vendor, model, risk_level, risk_score FROM devices ORDER BY risk_score DESC");
    const avgRisk = db.get("SELECT AVG(risk_score) as avg_score FROM devices").avg_score || 25;

    const riskCounts = {
      Low: 0,
      Medium: 0,
      High: 0,
      Critical: 0
    };

    for (const d of devices) {
      if (riskCounts[d.risk_level] !== undefined) {
        riskCounts[d.risk_level]++;
      }
    }

    res.json({
      average_risk_score: Math.round(avgRisk),
      total_assessed_devices: devices.length,
      distribution: riskCounts,
      top_risky_devices: devices.slice(0, 5),
      feature_weights: {
        f_remote: { name: "Remote Access Surface Exposure", weight: 28, description: "Telnet / plaintext transport exposure" },
        f_logging: { name: "Observability & Logging Deactivation", weight: 22, description: "Absence of audit trail and syslog" },
        f_auth: { name: "Credential & Password Hygiene", weight: 18, description: "Weak hashing or insufficient length" },
        f_perimeter: { name: "Perimeter Default-Deny Absence", weight: 14, description: "Permissive ingress firewall posture" },
        f_compliance: { name: "Regulatory Compliance Failure Ratio", weight: 10, description: "Weighted CIS benchmark violations" },
        f_crypto: { name: "Legacy Cryptography (SNMP/HTTP)", weight: 5, description: "Unencrypted management protocols" },
        f_drift: { name: "Configuration Drift Volatility", weight: 3, description: "Rapid unauthorized parameter delta" }
      },
      model_info: {
        architecture: "Multi-Feature Heuristic & Anomaly Scoring Model",
        pipeline_stage: "Feature Extractor -> Weighted Normalization -> Anomaly Heuristics -> Tiers",
        production_target: "Random Forest Classifier / Isolation Forest Anomaly Detector",
        explainability: "100% Deterministic & Transparent"
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all device risk assessments with problems and recommendations
router.get("/assessments", (req, res) => {
  try {
    const devices = db.query("SELECT id, name, vendor, model, ip_address, risk_level, risk_score, compliance_score, last_audit FROM devices ORDER BY risk_score DESC");

    const assessments = devices.map(d => {
      const riskRow = db.get(
        "SELECT * FROM risk_assessments WHERE device_id = ? ORDER BY assessed_at DESC LIMIT 1",
        [d.id]
      );

      let features = {};
      let detected_problems = [];
      let recommendations = [];

      if (riskRow) {
        try {
          features = JSON.parse(riskRow.features_json);
          detected_problems = JSON.parse(riskRow.detected_problems_json);
          recommendations = JSON.parse(riskRow.recommendations_json);
        } catch (e) {
          console.warn("Parse error for riskRow:", e);
        }
      }

      return {
        device_id: d.id,
        device_name: d.name,
        vendor: d.vendor,
        model: d.model,
        ip_address: d.ip_address,
        risk_score: d.risk_score,
        risk_level: d.risk_level,
        compliance_score: d.compliance_score,
        last_audit: d.last_audit,
        features,
        detected_problems,
        recommendations
      };
    });

    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST simulate AI Risk score calculation in real-time sandbox
router.post("/simulate", (req, res) => {
  try {
    const {
      vendor = "Fortinet",
      logging = "Enabled",
      remote_access = "Disabled",
      password_policy = "Strong",
      default_deny = true,
      snmp_version = "v3",
      http_web_access = false,
      unauthorized_changes_count = 0
    } = req.body;

    const mockConfig = {
      logging,
      remote_access,
      password_policy,
      default_deny,
      snmp_version,
      http_web_access,
      ntp_configured: true
    };

    const mockDevice = { name: "Sandbox-Device", vendor };
    const mockChanges = Array(unauthorized_changes_count).fill({ is_authorized: 0 });

    const riskResult = RiskAnalyzer.analyze(mockDevice, mockConfig, { totalRules: 8, results: [] }, mockChanges);

    res.json({
      input: req.body,
      riskResult
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
