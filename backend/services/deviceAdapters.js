/**
 * Device Adapters for Multi-Vendor Network Compliance Auditor
 * 
 * DESIGN PATTERN: Adapter & Factory
 * This layer abstracts vendor-specific CLI syntaxes and protocols (Cisco IOS/NX-OS,
 * FortiOS, Palo Alto PAN-OS, Juniper JunOS).
 * 
 * PRODUCTION EXTENSION:
 * In a production deployment connecting to physical/virtual hardware:
 * - Cisco: Uses SSH (Paramiko/Netmiko) or RESTCONF (RFC 8040) / NETCONF (RFC 6241)
 * - Fortinet: Uses FortiOS REST API (/api/v2/cmdb) or SSH CLI
 * - Palo Alto: Uses PAN-OS XML API (/api/?type=config&action=get) or SSH CLI
 * - Juniper: Uses JunOS PyEZ / NETCONF (RFC 6241) or SSH CLI
 */

export class BaseDeviceAdapter {
  constructor(vendorName) {
    this.vendorName = vendorName;
  }

  /**
   * Generates a realistic raw configuration CLI text for a given device and settings.
   */
  generateRawConfig(device, configData) {
    throw new Error("generateRawConfig must be implemented by subclass");
  }

  /**
   * Parses vendor CLI text into structured compliance features.
   */
  parseConfig(rawText) {
    throw new Error("parseConfig must be implemented by subclass");
  }

  /**
   * Generates vendor-specific remediation commands.
   */
  getRemediationCommand(issueType, details = {}) {
    return `# Generic remediation for ${this.vendorName}`;
  }
}

export class CiscoAdapter extends BaseDeviceAdapter {
  constructor() {
    super("Cisco");
  }

  generateRawConfig(device, cfg) {
    return `!
! Cisco IOS-XE Software, Version 17.06.03
! Device: ${device.name} (${device.model})
! IP: ${device.ip_address}
!
version 17.6
service timestamps debug datetime msec
service timestamps log datetime msec
${cfg.password_policy === "Strong" ? "service password-encryption\nsecurity passwords min-length 12" : "no service password-encryption"}
!
hostname ${device.name}
!
aaa new-model
aaa authentication login default local
!
${cfg.logging === "Enabled" ? "logging buffered 64000\nlogging host 192.168.1.250\nlogging trap informational" : "no logging on"}
!
${cfg.remote_access === "Disabled" ? "line vty 0 4\n transport input none" : "line vty 0 4\n transport input telnet ssh"}
!
${cfg.snmp_version === "v3" ? "snmp-server group SECGROUP v3 priv\nsnmp-server user admin SECGROUP v3 auth sha StrongAuthPass priv aes128 StrongPrivPass" : "snmp-server community public RO\nsnmp-server community private RW"}
!
${cfg.default_deny ? "ip access-list extended INBOUND_SEC\n permit tcp any any established\n deny ip any any log" : "ip access-list extended INBOUND_SEC\n permit ip any any"}
!
${cfg.http_web_access ? "ip http server\nip http secure-server" : "no ip http server\nip http secure-server"}
${cfg.ntp_configured ? "ntp server 192.168.1.100 prefer" : "! NTP not configured"}
!
end`;
  }

  getRemediationCommand(issueType) {
    switch (issueType) {
      case "logging":
        return `configure terminal\nlogging on\nlogging buffered 64000\nlogging host 192.168.1.250\nexit\nwrite memory`;
      case "remote_access":
        return `configure terminal\nline vty 0 15\n transport input ssh\n no transport input telnet\nexec-timeout 10 0\nexit\nwrite memory`;
      case "password_policy":
        return `configure terminal\nservice password-encryption\nsecurity passwords min-length 12\nexit\nwrite memory`;
      case "snmp_version":
        return `configure terminal\nno snmp-server community public\nno snmp-server community private\nsnmp-server group SECGROUP v3 priv\nexit\nwrite memory`;
      case "default_deny":
        return `configure terminal\nip access-list extended INBOUND_SEC\n no permit ip any any\n deny ip any any log\nexit\nwrite memory`;
      case "http_web_access":
        return `configure terminal\nno ip http server\nip http secure-server\nexit\nwrite memory`;
      default:
        return `# Apply recommended Cisco hardening guidelines`;
    }
  }
}

export class FortinetAdapter extends BaseDeviceAdapter {
  constructor() {
    super("Fortinet");
  }

  generateRawConfig(device, cfg) {
    return `# FortiOS v7.2.4 build1396 (GA)
# Device: ${device.name} (${device.model})
# IP: ${device.ip_address}

config system global
    set hostname "${device.name}"
    set admin-sport 8443
    set admin-ssh-port 22
    ${cfg.remote_access === "Disabled" ? 'set admin-lockout-threshold 3\n    set admin-lockout-duration 600' : 'set admin-telnet disable\n    set remote-authtimeout 60'}
    ${cfg.password_policy === "Strong" ? 'set password-policy enable\n    set password-min-length 12\n    set password-must-contain-symbols enable' : 'set password-policy disable'}
end

config log syslogd setting
    ${cfg.logging === "Enabled" ? 'set status enable\n    set server "192.168.1.250"\n    set mode udp\n    set port 514' : 'set status disable'}
end

config system admin
    edit "admin"
        set trusthost1 192.168.1.0 255.255.255.0
        ${cfg.remote_access === "Disabled" ? 'set accprofile "super_admin_restricted"' : 'set accprofile "super_admin"'}
    next
end

config firewall policy
    edit 1
        set name "Default-Deny-Inbound"
        set srcintf "wan1"
        set dstintf "internal"
        set srcaddr "all"
        set dstaddr "all"
        ${cfg.default_deny ? 'set action deny\n        set schedule "always"\n        set logtraffic all' : 'set action accept'}
    next
end`;
  }

  getRemediationCommand(issueType) {
    switch (issueType) {
      case "logging":
        return `config log syslogd setting\n    set status enable\n    set server "192.168.1.250"\n    set mode udp\n    set port 514\nend`;
      case "remote_access":
        return `config system global\n    set admin-telnet disable\n    set admin-sport 8443\n    set admin-ssh-port 22\nend\nconfig system interface\n    edit "wan1"\n        unset allowaccess telnet http\n    next\nend`;
      case "password_policy":
        return `config system global\n    set password-policy enable\n    set password-min-length 12\n    set password-must-contain-symbols enable\nend`;
      case "snmp_version":
        return `config system snmp sysinfo\n    set status enable\nend\nconfig system snmp user\n    edit "secops_v3"\n        set security-level auth-priv\n        set auth-proto sha256\n    next\nend`;
      case "default_deny":
        return `config firewall policy\n    edit 1\n        set action deny\n        set logtraffic all\n    next\nend`;
      default:
        return `# Execute FortiOS compliance hardening script`;
    }
  }
}

export class PaloAltoAdapter extends BaseDeviceAdapter {
  constructor() {
    super("Palo Alto");
  }

  generateRawConfig(device, cfg) {
    return `<config version="10.2.0" urldb="paloaltonetworks">
  <!-- Device: ${device.name} (${device.model}) -->
  <!-- IP: ${device.ip_address} -->
  <mgt-config>
    <users>
      <entry name="admin">
        <permissions><role-based><superuser>yes</superuser></role-based></permissions>
        <password-profile>${cfg.password_policy === "Strong" ? "Complexity-12Chars-Enforced" : "Default-Weak"}</password-profile>
      </entry>
    </users>
    <password-complexity>
      <enabled>${cfg.password_policy === "Strong" ? "yes" : "no"}</enabled>
      <minimum-length>12</minimum-length>
    </password-complexity>
  </mgt-config>
  <shared>
    <log-settings>
      <syslog>
        <entry name="HQ-SIEM">
          <server>192.168.1.250</server>
          <transport>UDP</transport>
          <port>514</port>
          <format>BSD</format>
          <facility>LOG_USER</facility>
          <status>${cfg.logging === "Enabled" ? "active" : "disabled"}</status>
        </entry>
      </syslog>
    </log-settings>
    <management-interface>
      <telnet>${cfg.remote_access === "Disabled" ? "no" : "yes"}</telnet>
      <ssh>yes</ssh>
      <http>${cfg.http_web_access ? "yes" : "no"}</http>
      <https>yes</https>
    </management-interface>
  </shared>
</config>`;
  }

  getRemediationCommand(issueType) {
    switch (issueType) {
      case "logging":
        return `set shared log-settings syslog HQ-SIEM server 192.168.1.250 port 514 facility LOG_USER\ncommit`;
      case "remote_access":
        return `set deviceconfig system service disable-telnet yes\nset deviceconfig system service disable-http yes\ncommit`;
      case "password_policy":
        return `set mgt-config password-complexity enabled yes minimum-length 12 uppercase-letters 1 lowercase-letters 1 numeric-letters 1 special-characters 1\ncommit`;
      case "snmp_version":
        return `set deviceconfig system snmp-setting version v3\ncommit`;
      case "default_deny":
        return `set rulebase security rules intrazone-default action deny log-end yes\ncommit`;
      default:
        return `# Apply PAN-OS Security Benchmark`;
    }
  }
}

export class JuniperAdapter extends BaseDeviceAdapter {
  constructor() {
    super("Juniper");
  }

  generateRawConfig(device, cfg) {
    return `## JunOS 22.4R1.10
## Device: ${device.name} (${device.model})
## IP: ${device.ip_address}

system {
    host-name ${device.name};
    services {
        ssh {
            protocol-version v2;
            ciphers [ aes256-gcm@openssh.com aes128-gcm@openssh.com ];
        }
        ${cfg.remote_access === "Disabled" ? "## Insecure remote access disabled" : "telnet;\n        web-management {\n            http;\n        }"}
    }
    syslog {
        ${cfg.logging === "Enabled" ? "host 192.168.1.250 {\n            any notice;\n            authorization info;\n        }" : "## Remote syslog not configured"}
    }
    login {
        ${cfg.password_policy === "Strong" ? "password {\n            format sha-512;\n            minimum-length 12;\n            change-frequency 90;\n        }" : "password {\n            minimum-length 6;\n        }"}
    }
    ${cfg.ntp_configured ? "ntp {\n        server 192.168.1.100 prefer;\n    }" : ""}
}
${cfg.snmp_version === "v3" ? "snmp {\n    v3 {\n        usm {\n            local-engine {\n                user secops {\n                    authentication-sha;\n                    privacy-aes128;\n                }\n            }\n        }\n    }\n}" : "snmp {\n    community public {\n        authorization read-only;\n    }\n}"}`;
  }

  getRemediationCommand(issueType) {
    switch (issueType) {
      case "logging":
        return `set system syslog host 192.168.1.250 any notice\ncommit and-quit`;
      case "remote_access":
        return `delete system services telnet\ndelete system services web-management http\nset system services ssh protocol-version v2\ncommit and-quit`;
      case "password_policy":
        return `set system login password minimum-length 12\nset system login password format sha-512\ncommit and-quit`;
      case "snmp_version":
        return `delete snmp community public\nset snmp v3 usm local-engine user secops authentication-sha privacy-aes128\ncommit and-quit`;
      default:
        return `# Execute JunOS hardening set`;
    }
  }
}

/**
 * Adapter Factory
 */
export class AdapterFactory {
  static getAdapter(vendor) {
    switch (vendor.toLowerCase()) {
      case "cisco":
        return new CiscoAdapter();
      case "fortinet":
        return new FortinetAdapter();
      case "palo alto":
      case "paloalto":
        return new PaloAltoAdapter();
      case "juniper":
        return new JuniperAdapter();
      default:
        return new CiscoAdapter();
    }
  }
}
