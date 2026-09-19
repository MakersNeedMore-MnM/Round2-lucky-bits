import bcrypt from "bcryptjs";
import db from "./database.js";
import { COMPLIANCE_RULES, ComplianceEngine } from "../services/complianceEngine.js";
import { AdapterFactory } from "../services/deviceAdapters.js";
import { RiskAnalyzer } from "../services/riskAnalyzer.js";

export function initDatabaseAndSeed() {
  console.log("Initializing database schema...");

  // Drop tables in safe order
  db.exec(`
    DROP TABLE IF EXISTS audit_reports;
    DROP TABLE IF EXISTS alerts;
    DROP TABLE IF EXISTS risk_assessments;
    DROP TABLE IF EXISTS compliance_results;
    DROP TABLE IF EXISTS compliance_rules;
    DROP TABLE IF EXISTS configuration_changes;
    DROP TABLE IF EXISTS configurations;
    DROP TABLE IF EXISTS devices;
    DROP TABLE IF EXISTS users;
  `);

  // Create Tables cleanly
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      vendor TEXT NOT NULL,
      model TEXT NOT NULL,
      device_type TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Online',
      last_audit DATETIME,
      compliance_score INTEGER DEFAULT 100,
      risk_level TEXT DEFAULT 'Low',
      risk_score INTEGER DEFAULT 15,
      location TEXT DEFAULT 'Headquarters DC-1',
      firmware_version TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE configurations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      version INTEGER NOT NULL DEFAULT 1,
      config_json TEXT NOT NULL,
      raw_config TEXT NOT NULL,
      is_current INTEGER NOT NULL DEFAULT 1,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE configuration_changes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      device_name TEXT NOT NULL,
      setting_name TEXT NOT NULL,
      previous_value TEXT NOT NULL,
      current_value TEXT NOT NULL,
      change_type TEXT NOT NULL DEFAULT 'Unauthorized',
      risk_level TEXT NOT NULL DEFAULT 'Medium',
      reason TEXT,
      recommendation TEXT,
      is_authorized INTEGER NOT NULL DEFAULT 0,
      detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE compliance_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      rule_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      severity TEXT NOT NULL,
      remediation_hint TEXT
    );

    CREATE TABLE compliance_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      rule_id TEXT NOT NULL,
      status TEXT NOT NULL,
      details TEXT,
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE risk_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
      risk_score INTEGER NOT NULL,
      risk_level TEXT NOT NULL,
      features_json TEXT NOT NULL,
      detected_problems_json TEXT NOT NULL,
      recommendations_json TEXT NOT NULL,
      assessed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
      device_name TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME
    );

    CREATE TABLE audit_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      generated_by TEXT NOT NULL DEFAULT 'SecOps Auditor',
      overall_compliance INTEGER NOT NULL,
      total_devices INTEGER NOT NULL,
      critical_issues INTEGER NOT NULL,
      high_risk_issues INTEGER NOT NULL,
      medium_risk_issues INTEGER NOT NULL,
      low_risk_issues INTEGER NOT NULL,
      summary_json TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Seeding admin user...");
  const hashedPassword = bcrypt.hashSync("Admin@123", 10);
  db.run(
    "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)",
    ["admin@example.com", hashedPassword, "Admin Auditor", "admin"]
  );

  console.log("Seeding compliance rules...");
  for (const rule of COMPLIANCE_RULES) {
    db.run(
      `INSERT INTO compliance_rules (rule_id, name, description, category, severity, remediation_hint)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [rule.rule_id, rule.name, rule.description, rule.category, rule.severity, rule.remediation_hint]
    );
  }

  console.log("Seeding 24 multi-vendor devices...");

  // Exactly 24 devices: 15 Safe, 5 Warning, 3 High Risk, 1 Critical
  const deviceSpecs = [
    // --- Fortinet (6 devices) ---
    // #1: The Demo Target: Starts completely SAFE / Compliant!
    {
      name: "Fortinet-Edge-FW",
      vendor: "Fortinet",
      model: "FortiGate 100F",
      device_type: "Firewall",
      ip_address: "192.168.1.20",
      location: "HQ Primary Edge",
      firmware: "FortiOS 7.2.4",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "Fortinet-Internal-FW",
      vendor: "Fortinet",
      model: "FortiGate 200F",
      device_type: "Firewall",
      ip_address: "192.168.1.21",
      location: "HQ Internal Core",
      firmware: "FortiOS 7.2.3",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "Fortinet-Branch-FW-01",
      vendor: "Fortinet",
      model: "FortiGate 60F",
      device_type: "Firewall",
      ip_address: "192.168.30.1",
      location: "Bangalore Branch",
      firmware: "FortiOS 7.0.9",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Moderate",
        default_deny: true,
        snmp_version: "v2c",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 15
      }
    },
    {
      name: "Fortinet-DC-FW-02",
      vendor: "Fortinet",
      model: "FortiGate 500E",
      device_type: "Firewall",
      ip_address: "192.168.20.20",
      location: "Mumbai Datacenter",
      firmware: "FortiOS 7.2.4",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "FortiSwitch-Dist-01",
      vendor: "Fortinet",
      model: "FortiSwitch 424E",
      device_type: "Switch",
      ip_address: "192.168.1.25",
      location: "HQ Distribution Row B",
      firmware: "FortiSwitchOS 7.2.1",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "Fortinet-DMZ-FW",
      vendor: "Fortinet",
      model: "FortiGate 80F",
      device_type: "Firewall",
      ip_address: "192.168.1.26",
      location: "DMZ Gateway Subnet",
      firmware: "FortiOS 7.2.2",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },

    // --- Cisco (7 devices) ---
    {
      name: "Cisco-Core-Router",
      vendor: "Cisco",
      model: "ISR 4451",
      device_type: "Router",
      ip_address: "192.168.1.10",
      location: "HQ Core Rack 01",
      firmware: "IOS-XE 17.6.3",
      config: {
        logging: "Enabled",
        remote_access: "Enabled",
        password_policy: "Moderate",
        default_deny: true,
        snmp_version: "v2c",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 15
      }
    },
    {
      name: "Cisco-Dist-SW-01",
      vendor: "Cisco",
      model: "Catalyst 9300",
      device_type: "Switch",
      ip_address: "192.168.1.11",
      location: "HQ Dist Rack 02",
      firmware: "IOS-XE 17.9.2",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "Cisco-Access-SW-02",
      vendor: "Cisco",
      model: "Catalyst 9200L",
      device_type: "Switch",
      ip_address: "192.168.1.12",
      location: "HQ Floor 3 IDF",
      firmware: "IOS-XE 17.3.5",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "Cisco-Border-GW",
      vendor: "Cisco",
      model: "ASR 1001-X",
      device_type: "Gateway",
      ip_address: "192.168.1.13",
      location: "HQ BGP Border",
      firmware: "IOS-XE 17.6.1a",
      config: {
        logging: "Disabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: false,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "Cisco-Branch-RT-01",
      vendor: "Cisco",
      model: "ISR 1100",
      device_type: "Router",
      ip_address: "192.168.10.1",
      location: "Delhi Branch Office",
      firmware: "IOS-XE 17.4.2",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "Cisco-DC-Leaf-01",
      vendor: "Cisco",
      model: "Nexus 93180YC",
      device_type: "Switch",
      ip_address: "192.168.20.11",
      location: "Mumbai DC Leaf Rack",
      firmware: "NX-OS 9.3(8)",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "Cisco-VPN-Concentrator",
      vendor: "Cisco",
      model: "ASA 5525-X",
      device_type: "Gateway",
      ip_address: "192.168.1.15",
      location: "HQ DMZ Edge",
      firmware: "ASA 9.16(2)",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },

    // --- Palo Alto (6 devices) ---
    {
      name: "PaloAlto-Primary-FW",
      vendor: "Palo Alto",
      model: "PA-3220",
      device_type: "Firewall",
      ip_address: "192.168.1.30",
      location: "HQ Edge Cluster",
      firmware: "PAN-OS 10.2.3",
      config: {
        logging: "Disabled",
        remote_access: "Enabled",
        password_policy: "Weak",
        default_deny: false,
        snmp_version: "v1",
        http_web_access: true,
        ntp_configured: false,
        session_timeout: 30
      }
    },
    {
      name: "PaloAlto-Secondary-FW",
      vendor: "Palo Alto",
      model: "PA-3220",
      device_type: "Firewall",
      ip_address: "192.168.1.31",
      location: "HQ Edge Standby",
      firmware: "PAN-OS 10.2.3",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "PaloAlto-Branch-FW-02",
      vendor: "Palo Alto",
      model: "PA-440",
      device_type: "Firewall",
      ip_address: "192.168.40.1",
      location: "Hyderabad Branch",
      firmware: "PAN-OS 10.1.6",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "PaloAlto-Cloud-GW",
      vendor: "Palo Alto",
      model: "VM-300",
      device_type: "Gateway",
      ip_address: "10.0.1.50",
      location: "AWS Transit VPC",
      firmware: "PAN-OS 10.2.1",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "PaloAlto-DC-Perimeter",
      vendor: "Palo Alto",
      model: "PA-5250",
      device_type: "Firewall",
      ip_address: "192.168.20.30",
      location: "Mumbai Datacenter Perimeter",
      firmware: "PAN-OS 10.2.4",
      config: {
        logging: "Disabled",
        remote_access: "Disabled",
        password_policy: "Weak",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "PaloAlto-OT-Segment",
      vendor: "Palo Alto",
      model: "PA-850",
      device_type: "Firewall",
      ip_address: "192.168.50.1",
      location: "Plant SCADA Enclave",
      firmware: "PAN-OS 9.1.12",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Moderate",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: true,
        ntp_configured: true,
        session_timeout: 15
      }
    },

    // --- Juniper (5 devices) ---
    {
      name: "Juniper-Core-SW",
      vendor: "Juniper",
      model: "EX3400-48T",
      device_type: "Switch",
      ip_address: "192.168.1.40",
      location: "HQ Campus Core",
      firmware: "Junos 21.4R2",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Moderate",
        default_deny: true,
        snmp_version: "v2c",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "Juniper-Edge-RT",
      vendor: "Juniper",
      model: "MX204",
      device_type: "Router",
      ip_address: "192.168.1.41",
      location: "HQ WAN Interconnect",
      firmware: "Junos 22.2R1",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "Juniper-SRX-Branch",
      vendor: "Juniper",
      model: "SRX345",
      device_type: "Gateway",
      ip_address: "192.168.60.1",
      location: "Chennai Branch Office",
      firmware: "Junos 21.4R3",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "Juniper-Aggregation-SW",
      vendor: "Juniper",
      model: "QFX5120",
      device_type: "Switch",
      ip_address: "192.168.20.40",
      location: "Mumbai Aggregation Row",
      firmware: "Junos 22.4R1",
      config: {
        logging: "Disabled",
        remote_access: "Enabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: true,
        session_timeout: 10
      }
    },
    {
      name: "Juniper-Campus-Leaf",
      vendor: "Juniper",
      model: "EX2300-24T",
      device_type: "Switch",
      ip_address: "192.168.1.45",
      location: "HQ Floor 1 IDF",
      firmware: "Junos 21.1R1",
      config: {
        logging: "Enabled",
        remote_access: "Disabled",
        password_policy: "Strong",
        default_deny: true,
        snmp_version: "v3",
        http_web_access: false,
        ntp_configured: false,
        session_timeout: 10
      }
    }
  ];

  for (const spec of deviceSpecs) {
    const res = db.run(
      `INSERT INTO devices (name, vendor, model, device_type, ip_address, location, firmware_version, last_audit)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 hours'))`,
      [spec.name, spec.vendor, spec.model, spec.device_type, spec.ip_address, spec.location, spec.firmware]
    );

    const deviceId = res.lastInsertRowid;
    const adapter = AdapterFactory.getAdapter(spec.vendor);
    const rawConfig = adapter.generateRawConfig({ name: spec.name, model: spec.model, ip_address: spec.ip_address }, spec.config);

    // Baseline configuration (version 1)
    db.run(
      `INSERT INTO configurations (device_id, version, config_json, raw_config, is_current, timestamp)
       VALUES (?, 1, ?, ?, 0, datetime('now', '-2 days'))`,
      [deviceId, JSON.stringify(spec.config), rawConfig]
    );

    // Current configuration (version 2)
    db.run(
      `INSERT INTO configurations (device_id, version, config_json, raw_config, is_current, timestamp)
       VALUES (?, 2, ?, ?, 1, datetime('now', '-10 minutes'))`,
      [deviceId, JSON.stringify(spec.config), rawConfig]
    );

    // Evaluate compliance
    const compliance = ComplianceEngine.evaluate(spec.config);
    for (const r of compliance.results) {
      db.run(
        `INSERT INTO compliance_results (device_id, rule_id, status, details) VALUES (?, ?, ?, ?)`,
        [deviceId, r.rule_id, r.status, r.details]
      );
    }

    // Evaluate risk
    const risk = RiskAnalyzer.analyze({ name: spec.name, vendor: spec.vendor, device_type: spec.device_type }, spec.config, compliance, []);
    db.run(
      `INSERT INTO risk_assessments (device_id, risk_score, risk_level, features_json, detected_problems_json, recommendations_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        deviceId,
        risk.riskScore,
        risk.riskLevel,
        JSON.stringify(risk.features),
        JSON.stringify(risk.detectedProblems),
        JSON.stringify(risk.recommendations)
      ]
    );

    // Update device
    db.run(
      `UPDATE devices SET compliance_score = ?, risk_level = ?, risk_score = ? WHERE id = ?`,
      [compliance.complianceScore, risk.riskLevel, risk.riskScore, deviceId]
    );
  }

  console.log("Seeding baseline configuration changes...");
  db.run(`
    INSERT INTO configuration_changes 
    (device_id, device_name, setting_name, previous_value, current_value, change_type, risk_level, reason, recommendation, is_authorized, detected_at)
    VALUES 
    (14, 'PaloAlto-Primary-FW', 'Password Policy', 'Strong', 'Weak', 'Unauthorized', 'Critical', 'Password policy complexity modified to weak without change advisory approval.', 'Re-enforce password complexity and 12-char minimum.', 0, datetime('now', '-2 hours')),
    (7, 'Cisco-Core-Router', 'Remote Access', 'Disabled', 'Enabled', 'Unauthorized', 'Medium', 'Remote VTY line access enabled across all subnets.', 'Restrict remote access to SSHv2 management jump host only.', 0, datetime('now', '-5 hours')),
    (10, 'Cisco-Border-GW', 'Logging', 'Enabled', 'Disabled', 'Unauthorized', 'High', 'Syslog service deactivated during maintenance and not re-enabled.', 'Re-enable buffered and remote SIEM logging.', 0, datetime('now', '-8 hours'))
  `);

  console.log("Seeding baseline alerts...");
  db.run(`
    INSERT INTO alerts (device_id, device_name, severity, title, message, status, created_at)
    VALUES
    (14, 'PaloAlto-Primary-FW', 'Critical', 'Unauthorized configuration change detected on PaloAlto-Primary-FW', 'Password complexity disabled and insecure administrative ports opened.', 'Active', datetime('now', '-2 hours')),
    (10, 'Cisco-Border-GW', 'High', 'Logging disabled on Cisco-Border-GW', 'Centralized syslog was disabled; forensic integrity degraded.', 'Active', datetime('now', '-8 hours')),
    (7, 'Cisco-Core-Router', 'Medium', 'Remote access configuration changed on Cisco-Core-Router', 'VTY transport input modified to permit unencrypted remote sessions.', 'Active', datetime('now', '-5 hours'))
  `);

  console.log("Database initialized and seeded successfully!");
}

if (process.argv[1] && process.argv[1].includes("initialSeed.js")) {
  initDatabaseAndSeed();
}
