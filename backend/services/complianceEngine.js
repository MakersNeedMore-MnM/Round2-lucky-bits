/**
 * Security & Compliance Engine (CIS Benchmarks & NIST 800-53 inspired)
 */

export const COMPLIANCE_RULES = [
  {
    rule_id: "RULE-001",
    name: "Strong Password Policy Required",
    description: "Enforce minimum 12-character length, complex character classes, and reversible encryption disablement across all admin accounts.",
    category: "Access Control",
    severity: "High",
    remediation_hint: "Enable password complexity, set minimum length to >= 12, and encrypt local credentials."
  },
  {
    rule_id: "RULE-002",
    name: "Centralized Logging & Auditing Enabled",
    description: "Audit logging and remote SIEM/Syslog transmission must be enabled to guarantee security event visibility and non-repudiation.",
    category: "Logging & Monitoring",
    severity: "High",
    remediation_hint: "Enable system logging and configure remote syslog server target (UDP 514 / TCP 6514)."
  },
  {
    rule_id: "RULE-003",
    name: "Insecure Remote Access Prohibited",
    description: "Cleartext remote management interfaces (Telnet, rlogin, raw terminal) must be strictly disabled. Only SSHv2 is allowed.",
    category: "Network Security",
    severity: "Critical",
    remediation_hint: "Disable Telnet and permit SSHv2 transport only on virtual terminal management lines."
  },
  {
    rule_id: "RULE-004",
    name: "Default Inbound Traffic Blocked (Default-Deny)",
    description: "Perimeter firewall and gateway access control lists must enforce a strict default-deny rule on inbound traffic.",
    category: "Network Security",
    severity: "High",
    remediation_hint: "Apply explicit deny all inbound rule as the lowest priority rule in the policy table."
  },
  {
    rule_id: "RULE-005",
    name: "SNMPv3 Authentication & Encryption Required",
    description: "Legacy SNMPv1 and SNMPv2c protocols transmit community strings in cleartext. SNMPv3 with auth and priv is mandatory.",
    category: "Encryption",
    severity: "Medium",
    remediation_hint: "Remove legacy community strings (public/private) and configure SNMPv3 with SHA auth and AES priv."
  },
  {
    rule_id: "RULE-006",
    name: "Secure Web Management (HTTPS Only)",
    description: "HTTP plaintext web management interfaces must be disabled in favor of TLS 1.2+ encrypted HTTPS management.",
    category: "Encryption",
    severity: "Medium",
    remediation_hint: "Disable HTTP web server and enforce HTTPS with a valid certificate on administrative ports."
  },
  {
    rule_id: "RULE-007",
    name: "Synchronized NTP Time Source Configured",
    description: "Network devices must synchronize clocks with authorized internal NTP time sources for log correlation forensic integrity.",
    category: "System Integrity",
    severity: "Low",
    remediation_hint: "Configure authenticated NTP servers to ensure timestamp alignment across telemetry."
  },
  {
    rule_id: "RULE-008",
    name: "Administrative Session Timeout Enforced",
    description: "Idle administrative sessions (CLI/Web) must automatically disconnect after 10 minutes or less of inactivity.",
    category: "Access Control",
    severity: "Medium",
    remediation_hint: "Configure exec-timeout to 10 minutes (600 seconds) on all management sessions."
  }
];

export class ComplianceEngine {
  /**
   * Evaluates a device configuration against all compliance rules.
   */
  static evaluate(config) {
    const results = [];
    let passedCount = 0;
    let totalScoreWeight = 0;
    let earnedWeight = 0;

    const weights = {
      Critical: 30,
      High: 20,
      Medium: 10,
      Low: 5
    };

    for (const rule of COMPLIANCE_RULES) {
      const weight = weights[rule.severity] || 10;
      totalScoreWeight += weight;
      let status = "PASS";
      let details = "Configuration complies with policy.";

      switch (rule.rule_id) {
        case "RULE-001":
          if (config.password_policy === "Weak") {
            status = "FAIL";
            details = "Password policy is set to Weak. Minimum length is less than 12 characters and encryption is inactive.";
          } else if (config.password_policy === "Moderate") {
            status = "WARNING";
            details = "Password policy is Moderate. Reversible password hashing is still permitted.";
            earnedWeight += weight * 0.5;
          } else {
            earnedWeight += weight;
            passedCount++;
          }
          break;

        case "RULE-002":
          if (config.logging !== "Enabled") {
            status = "FAIL";
            details = "System logging is disabled. Forensic visibility and compliance audit trail are lost.";
          } else {
            earnedWeight += weight;
            passedCount++;
          }
          break;

        case "RULE-003":
          if (config.remote_access === "Enabled") {
            status = "FAIL";
            details = "Insecure remote access is active. Telnet or unauthenticated remote access detected.";
          } else {
            earnedWeight += weight;
            passedCount++;
          }
          break;

        case "RULE-004":
          if (!config.default_deny) {
            status = "FAIL";
            details = "Default-deny policy missing. Permissive wildcard access allowed from untrusted zones.";
          } else {
            earnedWeight += weight;
            passedCount++;
          }
          break;

        case "RULE-005":
          if (config.snmp_version !== "v3") {
            status = "WARNING";
            details = `Legacy SNMP ${config.snmp_version || "v2c"} in use. Community strings can be intercepted on the wire.`;
            earnedWeight += weight * 0.4;
          } else {
            earnedWeight += weight;
            passedCount++;
          }
          break;

        case "RULE-006":
          if (config.http_web_access) {
            status = "WARNING";
            details = "Plaintext HTTP web administration interface is enabled alongside or without HTTPS.";
            earnedWeight += weight * 0.5;
          } else {
            earnedWeight += weight;
            passedCount++;
          }
          break;

        case "RULE-007":
          if (!config.ntp_configured) {
            status = "FAIL";
            details = "NTP synchronization is not configured. Log timestamps may drift.";
          } else {
            earnedWeight += weight;
            passedCount++;
          }
          break;

        case "RULE-008":
          if (config.session_timeout && config.session_timeout > 10) {
            status = "WARNING";
            details = `Session timeout is set to ${config.session_timeout} min (exceeds 10 min threshold).`;
            earnedWeight += weight * 0.5;
          } else {
            earnedWeight += weight;
            passedCount++;
          }
          break;

        default:
          earnedWeight += weight;
          passedCount++;
          break;
      }

      results.push({
        rule_id: rule.rule_id,
        name: rule.name,
        category: rule.category,
        severity: rule.severity,
        status,
        details,
        remediation_hint: rule.remediation_hint
      });
    }

    const complianceScore = Math.round((earnedWeight / totalScoreWeight) * 100);

    return {
      complianceScore,
      passedCount,
      totalRules: COMPLIANCE_RULES.length,
      results
    };
  }
}
