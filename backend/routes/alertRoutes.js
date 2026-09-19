import express from "express";
import db from "../data/database.js";

const router = express.Router();

// GET all alerts with filtering
router.get("/", (req, res) => {
  try {
    const { status, severity, search } = req.query;
    let sql = `
      SELECT a.*, d.vendor, d.model, d.ip_address, d.risk_score
      FROM alerts a
      LEFT JOIN devices d ON a.device_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== "All") {
      sql += " AND a.status = ?";
      params.push(status);
    }
    if (severity && severity !== "All") {
      sql += " AND a.severity = ?";
      params.push(severity);
    }
    if (search) {
      sql += " AND (a.title LIKE ? OR a.message LIKE ? OR a.device_name LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += " ORDER BY CASE a.severity WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, a.created_at DESC";

    const alerts = db.query(sql, params);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET count of active alerts for header badge
router.get("/count", (req, res) => {
  try {
    const active = db.get("SELECT COUNT(*) as count FROM alerts WHERE status = 'Active'").count;
    const critical = db.get("SELECT COUNT(*) as count FROM alerts WHERE status = 'Active' AND severity = 'Critical'").count;
    res.json({ active, critical });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH acknowledge alert
router.patch("/:id/acknowledge", (req, res) => {
  try {
    const alertId = req.params.id;
    db.run("UPDATE alerts SET status = 'Acknowledged' WHERE id = ?", [alertId]);
    const updated = db.get("SELECT * FROM alerts WHERE id = ?", [alertId]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH resolve alert
router.patch("/:id/resolve", (req, res) => {
  try {
    const alertId = req.params.id;
    db.run(
      "UPDATE alerts SET status = 'Resolved', resolved_at = CURRENT_TIMESTAMP WHERE id = ?",
      [alertId]
    );
    const updated = db.get("SELECT * FROM alerts WHERE id = ?", [alertId]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
