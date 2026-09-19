/**
 * Configuration Drift & Change Detection Engine
 */

export class ChangeDetector {
  /**
   * Compares two configurations (previous vs current) and detects changed settings.
   */
  static detectChanges(deviceId, deviceName, prevConfig, currConfig, isAuthorized = false) {
    const changes = [];
    const keysToCheck = [
      { key: "logging", label: "Logging", riskOnDisable: "High" },
      { key: "remote_access", label: "Remote Access", riskOnEnable: "High" },
      { key: "password_policy", label: "Password Policy", riskOnWeak: "Critical" },
      { key: "default_deny", label: "Default Inbound Traffic Blocked", riskOnDisable: "High" },
      { key: "snmp_version", label: "SNMP Version", riskOnLegacy: "Medium" },
      { key: "http_web_access", label: "HTTP Web Access", riskOnEnable: "Medium" },
      { key: "ntp_configured", label: "NTP Configuration", riskOnDisable: "Low" }
    ];

    for (const item of keysToCheck) {
      const prevVal = prevConfig[item.key];
      const currVal = currConfig[item.key];

      if (prevVal !== undefined && currVal !== undefined && prevVal !== currVal) {
        let riskLevel = "Medium";
        let reason = `Configuration attribute '${item.label}' modified from '${prevVal}' to '${currVal}'.`;
        let recommendation = `Verify if change was planned in change window. Restore previous value if unauthorized.`;

        if (item.key === "logging" && currVal === "Disabled") {
          riskLevel = "High";
          reason = "Disabling logging severely reduces visibility into security events and audit trails.";
          recommendation = "Enable logging according to the organization's security policy.";
        } else if (item.key === "remote_access" && currVal === "Enabled") {
          riskLevel = "High";
          reason = "Enabling insecure remote access exposes administrative interfaces to brute force and interception.";
          recommendation = "Disable remote access or restrict management strictly to SSHv2 with trusted jump hosts.";
        } else if (item.key === "password_policy" && currVal === "Weak") {
          riskLevel = "Critical";
          reason = "Weakening password policies invites credential attacks and compromises device boundary.";
          recommendation = "Enforce strong password policy with minimum 12 chars and complex character sets.";
        } else if (item.key === "default_deny" && !currVal) {
          riskLevel = "High";
          reason = "Removing default deny permits unintended ingress network connections.";
          recommendation = "Reinstate explicit default-deny rule at the end of firewall rulebase.";
        }

        changes.push({
          device_id: deviceId,
          device_name: deviceName,
          setting_name: item.label,
          previous_value: String(prevVal),
          current_value: String(currVal),
          change_type: isAuthorized ? "Authorized" : "Unauthorized",
          risk_level: riskLevel,
          reason,
          recommendation,
          is_authorized: isAuthorized ? 1 : 0
        });
      }
    }

    return changes;
  }
}
