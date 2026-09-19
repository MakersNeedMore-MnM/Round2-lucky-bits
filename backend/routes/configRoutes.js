import express from "express";
import db from "../data/database.js";
import { ChangeDetector } from "../services/changeDetector.js";

const router = express.Router();

// GET configuration comparison for a device
router.get("/devices/:id/configuration", (req, res) => {
  try {
    const deviceId = req.params.id;
    const device = db.get("SELECT * FROM devices WHERE id = ?", [deviceId]);
    if (!device) return res.status(404).json({ error: "Device not found" });

    const configs = db.query(
      "SELECT * FROM configurations WHERE device_id = ? ORDER BY version DESC",
      [deviceId]
    );

    const currentConfigRow = configs.find(c => c.is_current === 1) || configs[0] || null;
    const previousConfigRow = configs.find(c => c.is_current === 0) || configs[1] || currentConfigRow;

    const currentConfig = currentConfigRow ? JSON.parse(currentConfigRow.config_json) : {};
    const previousConfig = previousConfigRow ? JSON.parse(previousConfigRow.config_json) : {};

    const diffs = ChangeDetector.detectChanges(
      device.id,
      device.name,
      previousConfig,
      currentConfig,
      false
    );

    res.json({
      device,
      currentVersion: currentConfigRow ? currentConfigRow.version : 1,
      previousVersion: previousConfigRow ? previousConfigRow.version : 1,
      currentTimestamp: currentConfigRow ? currentConfigRow.timestamp : null,
      previousTimestamp: previousConfigRow ? previousConfigRow.timestamp : null,
      currentConfig,
      previousConfig,
      currentRaw: currentConfigRow ? currentConfigRow.raw_config : "",
      previousRaw: previousConfigRow ? previousConfigRow.raw_config : "",
      diffs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all configurations list
router.get("/configurations", (req, res) => {
  try {
    const configs = db.query(`
      SELECT c.id, c.device_id, c.version, c.is_current, c.timestamp, d.name as device_name, d.vendor, d.model
      FROM configurations c
      JOIN devices d ON c.device_id = d.id
      ORDER BY c.timestamp DESC
      LIMIT 50
    `);
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
