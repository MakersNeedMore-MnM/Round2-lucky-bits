import express from "express";
import db from "../data/database.js";

const router = express.Router();

// GET all compliance rules with evaluation statistics
router.get("/", (req, res) => {
  try {
    const rules = db.query("SELECT * FROM compliance_rules ORDER BY rule_id ASC");
    const totalDevices = db.get("SELECT COUNT(*) as count FROM devices").count;

    const enrichedRules = rules.map(rule => {
      const stats = db.get(`
        SELECT 
          COUNT(CASE WHEN status = 'PASS' THEN 1 END) as pass_count,
          COUNT(CASE WHEN status = 'WARNING' THEN 1 END) as warning_count,
          COUNT(CASE WHEN status = 'FAIL' THEN 1 END) as fail_count,
          COUNT(*) as total_evaluated
        FROM compliance_results
        WHERE rule_id = ?
      `, [rule.rule_id]);

      // Determine rule aggregate status
      let overallStatus = "PASS";
      if (stats.fail_count > 0) {
        overallStatus = "FAIL";
      } else if (stats.warning_count > 0) {
        overallStatus = "WARNING";
      }

      // Query affected (non-passing) devices
      const affectedDevices = db.query(`
        SELECT d.id, d.name, d.vendor, d.ip_address, cr.status, cr.details
        FROM compliance_results cr
        JOIN devices d ON cr.device_id = d.id
        WHERE cr.rule_id = ? AND cr.status != 'PASS'
        ORDER BY d.name ASC
      `, [rule.rule_id]);

      return {
        ...rule,
        status: overallStatus,
        pass_count: stats.pass_count || 0,
        warning_count: stats.warning_count || 0,
        fail_count: stats.fail_count || 0,
        total_devices: totalDevices,
        compliance_rate: totalDevices > 0 ? Math.round(((stats.pass_count || 0) / totalDevices) * 100) : 100,
        affected_count: affectedDevices.length,
        affected_devices: affectedDevices
      };
    });

    // Overall compliance score
    const avgScore = db.get("SELECT AVG(compliance_score) as avg_score FROM devices").avg_score || 85;

    res.json({
      overall_compliance: Math.round(avgScore),
      total_rules: rules.length,
      passing_rules: enrichedRules.filter(r => r.status === "PASS").length,
      warning_rules: enrichedRules.filter(r => r.status === "WARNING").length,
      failing_rules: enrichedRules.filter(r => r.status === "FAIL").length,
      rules: enrichedRules
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET specific rule details and affected devices
router.get("/rules/:id", (req, res) => {
  try {
    const ruleId = req.params.id;
    const rule = db.get("SELECT * FROM compliance_rules WHERE rule_id = ? OR id = ?", [ruleId, ruleId]);
    if (!rule) return res.status(404).json({ error: "Compliance rule not found" });

    const results = db.query(`
      SELECT cr.id, cr.device_id, cr.status, cr.details, cr.checked_at,
             d.name as device_name, d.vendor, d.model, d.ip_address, d.risk_level
      FROM compliance_results cr
      JOIN devices d ON cr.device_id = d.id
      WHERE cr.rule_id = ?
      ORDER BY cr.status DESC, d.name ASC
    `, [rule.rule_id]);

    res.json({ rule, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
