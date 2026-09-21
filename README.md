# AI-Driven Multi-Vendor Network Security Compliance Auditor
**MAKER NEEDS MORE_MORROW_Prototype**
**TEAM NAME - LUCKY BITS**
TEAM MEMBERS
1) RENUKHA DEVI S
2) REGAA G
3) SUBHASREE G B
4) SATHIYA JANANI S
> Centralized multi-vendor network compliance auditing, configuration drift monitoring, CIS/NIST benchmark verification, deterministic AI/ML risk scoring, automated alert generation, and remediation guidance for Cisco, Fortinet, Palo Alto, and Juniper infrastructures.

---

## 📑 Table of Contents
1. [Project Overview & Purpose](#project-overview--purpose)
2. [Key Capabilities](#key-capabilities)
3. [Architecture & Technology Stack](#architecture--technology-stack)
4. [Project Structure](#project-structure)
5. [Quickstart & Installation](#quickstart--installation)
6. [Demo Login Credentials](#demo-login-credentials)
7. [Step-by-Step Demonstration Script](#step-by-step-sih-2026-demonstration-script)
8. [Where AI / ML is Used & Model Architecture](#where-ai--ml-is-used--model-architecture)
9. [How Real Cisco / Fortinet / Palo Alto Hardware Integrations Are Added](#how-real-cisco--fortinet--palo-alto-hardware-integrations-are-added)
10. [REST API Documentation](#rest-api-documentation)

---

## 1. Project Overview & Purpose

Modern enterprise networks consist of diverse hardware from multiple vendors (e.g., Cisco core routers and Catalyst switches, Fortinet edge firewalls, Palo Alto datacenter perimeter firewalls, and Juniper aggregation switches). Because each vendor uses distinct proprietary command-line interfaces (IOS-XE, FortiOS, PAN-OS XML, JunOS), centralized security auditing is manual, error-prone, and prone to configuration drift.

**This platform solves the problem by providing:**
- Centralized registration and monitoring of heterogeneous devices.
- Automated configuration collection and baseline storage.
- Real-time detection of unauthorized parameter modifications.
- Policy evaluation against CIS Network Device Benchmarks and NIST 800-53 controls.
- Explainable AI/ML risk scoring (0–100) assigning actionable risk tiers (Low, Medium, High, Critical).
- Plain-English remediation instructions with copy-pasteable vendor-specific CLI commands.
- Executive audit report generation with one-click print and PDF export.

---

## 2. Key Capabilities

- **Multi-Vendor Telemetry Support**: Pre-seeded with 24 enterprise devices spanning **Cisco**, **Fortinet**, **Palo Alto**, and **Juniper**.
- **Configuration Drift Visualizer**: Side-by-side comparison highlighting changes using standard cybersecurity color indicators:
  - 🟢 **GREEN**: Unchanged / Safe baseline
  - 🟡 **YELLOW**: Warning / Moderate policy deviation
  - 🔴 **RED**: Risky unauthorized alteration / Critical vulnerability
- **CIS Benchmark Engine**: 8 comprehensive rules (Rule 001 to Rule 008) evaluating password complexity, centralized logging, remote access hardening, default-deny ACLs, SNMPv3, HTTPS enforcement, and NTP synchronization.
- **Explainable AI/ML Risk Scoring**: Deterministic multi-factor feature extraction (`riskAnalyzer.js`) mapping configuration attributes to an anomaly likelihood and risk score.
- **Interactive AI Sandbox**: Live parameter tuning workbench allowing judges and engineers to test how parameter changes affect anomaly confidence and risk scores.
- **Autonomous Alerts Center**: Immediate event generation with workflow states (`Active`, `Acknowledged`, `Resolved`).
- **Executive Audit Dossier**: Formatted printable reports containing executive summary, device posture, configuration changes, compliance violations, and prioritized remediations.

---

## 3. Architecture & Technology Stack

```
NETWORK DEVICES (Cisco, Fortinet, Palo Alto, Juniper)
       ↓
DATA COLLECTION (Adapter Pattern / CLI Normalizer)
       ↓
CONFIGURATION STORAGE (SQLite Versioned Snapshots)
       ↓
CHANGE DETECTION (Delta Engine)
       ↓
AI / ML ANALYSIS (Multi-Factor Feature Extractor)
       ↓
RISK ASSESSMENT (Heuristic Risk Classifier: 0 - 100)
       ↓
SECURITY & COMPLIANCE CHECK (CIS / NIST Validator)
       ↓
ALERT & RECOMMENDATION (SecOps Dispatcher & Remediation CLI)
       ↓
DASHBOARD (Centralized Operations Center)
```

### Technology Stack
- **Frontend**: React 18, Vite, React Router v7, Lucide React icons, Recharts data visualization.
- **Styling**: Cyber-dark cybersecurity design system (`#070b14` obsidian void, glowing cyan accents, responsive cards, print-ready CSS).
- **Backend**: Node.js (v24), Express.js REST API.
- **Database**: SQLite (Node built-in `DatabaseSync` engine with WAL mode and zero external C++ build dependencies).
- **Security & Auth**: JWT (JSON Web Tokens) with `bcryptjs` password hashing.

---

## 4. Project Structure

```
network-compliance-auditor/
├── backend/
│   ├── data/
│   │   ├── database.js          # SQLite connection and query helper
│   │   ├── initialSeed.js       # 24 multi-vendor devices, admin user, 8 CIS rules
│   │   └── network_auditor.db   # Persistent SQLite database file
│   ├── middleware/
│   │   └── auth.js              # JWT verification middleware
│   ├── services/
│   │   ├── deviceAdapters.js    # Cisco, Fortinet, Palo Alto, Juniper adapters
│   │   ├── changeDetector.js    # Differential engine detecting unauthorized changes
│   │   ├── complianceEngine.js  # CIS/NIST rule evaluation engine
│   │   ├── riskAnalyzer.js      # AI/ML feature extractor & deterministic risk calculator
│   │   └── auditService.js      # End-to-end audit orchestrator
│   ├── routes/
│   │   ├── authRoutes.js        # /api/auth/login, /api/auth/me
│   │   ├── deviceRoutes.js      # /api/devices (CRUD, filter, single audit)
│   │   ├── configRoutes.js      # /api/devices/:id/configuration
│   │   ├── changeRoutes.js      # /api/changes, /api/changes/simulate
│   │   ├── complianceRoutes.js  # /api/compliance (Rule catalog & stats)
│   │   ├── riskRoutes.js        # /api/risk, /api/risk/simulate
│   │   ├── alertRoutes.js       # /api/alerts (ack, resolve, count)
│   │   ├── auditRoutes.js       # /api/audit/run
│   │   ├── dashboardRoutes.js   # /api/dashboard
│   │   ├── reportRoutes.js      # /api/reports/generate
│   │   └── demoRoutes.js        # /api/demo/scenario-fortinet, /api/demo/reset
│   ├── server.js                # Express app entry point (port 5000)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx             # Shell layout with Sidebar and Header
│   │   │   ├── Sidebar.jsx            # Left navigation with active badge counters
│   │   │   ├── Header.jsx             # Top bar with status and quick action buttons
│   │   │   ├── DemoControlBar.jsx     # SIH demo action bar (Scenario, Audit, Reset)
│   │   │   ├── AuditProgressModal.jsx # Multi-step animated audit workflow
│   │   │   ├── StatCard.jsx           # KPI metrics card component
│   │   │   ├── VendorBadge.jsx        # Vendor pills (Cisco, Fortinet, Palo Alto, Juniper)
│   │   │   ├── RiskBadge.jsx          # Colored risk tiers (Low, Medium, High, Critical)
│   │   │   └── ConfigDiffViewer.jsx   # Side-by-side color-coded configuration diff
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx          # Cyber-themed login screen
│   │   │   ├── DashboardPage.jsx      # Central KPIs, charts, and activity
│   │   │   ├── DevicesPage.jsx        # Multi-vendor inventory with filters
│   │   │   ├── DeviceDetailsPage.jsx  # Deep telemetry, config diff, compliance rules
│   │   │   ├── ConfigurationPage.jsx  # Configuration monitoring & drift reason
│   │   │   ├── ChangesPage.jsx        # Change detection timeline & simulation
│   │   │   ├── CompliancePage.jsx     # CIS benchmark rules catalog
│   │   │   ├── AiAnalysisPage.jsx     # AI feature extraction & interactive simulator
│   │   │   ├── RiskAssessmentPage.jsx # Device risk rankings & actionable steps
│   │   │   ├── AlertsPage.jsx         # Real-time incident management queue
│   │   │   ├── ReportsPage.jsx        # 6-section printable executive audit report
│   │   │   └── SettingsPage.jsx       # Multi-vendor adapter configurations
│   │   ├── services/
│   │   │   └── api.js                 # Unified REST client with JWT interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Authentication and session state
│   │   ├── App.jsx                    # React Router configuration
│   │   ├── index.css                  # Cybersecurity theme styles
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
├── package.json                       # Root convenience commands
└── README.md
```

---

## 5. Quickstart & Installation

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 1. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup & Seeding
The database initializes automatically when the backend starts. To reseed the clean 24-device baseline at any time:
```bash
cd backend
node data/initialSeed.js
```

### 3. Start Backend Server
```bash
cd backend
npm start
# Server boots on http://localhost:5000
```

### 4. Start Frontend Client
```bash
cd frontend
npm run dev
# Web application opens on http://localhost:3000
```

---

## 6. Demo Login Credentials

Navigate to `http://localhost:3000/login` in your browser:

| Role | Email | Password |
|---|---|---|
| **SecOps Admin** | `admin@example.com` | `Admin@123` |

*(A convenient "Fill Credentials" button is provided directly on the login card for quick entry during presentations).*

---

## 7. Step-by-Step SIH 2026 Demonstration Script

Follow this sequential workflow during judging or evaluations:

### Step 1: Login & Initial Posture Inspection
1. Open `http://localhost:3000/login`. Click **Fill Credentials** and submit.
2. The **Dashboard** loads with 24 devices:
   - **Safe Devices**: 19 (or 15 depending on simulated state)
   - **Warning Devices**: 4
   - **High Risk Devices**: 0
   - **Critical Issues**: 1 (the baseline intentionally includes one misconfigured honeypot node)
   - **Overall Compliance**: ~88%
3. Note that `Fortinet-Edge-FW` is currently in a **SAFE** baseline state (`Logging: Enabled`, `Remote Access: Disabled`, `Password Policy: Strong`).

### Step 2: Multi-Vendor Inventory Review
1. Navigate to the **Devices** page.
2. Filter by Vendor (**Cisco**, **Fortinet**, **Palo Alto**, **Juniper**) to show vendor-agnostic inventory handling.
3. Click on `Fortinet-Edge-FW` to view its details. Point out the **GREEN** unchanged parameters in the configuration diff viewer.

### Step 3: Trigger the SIH Demonstration Scenario
1. Click the orange **[Simulate Configuration Change]** button in the top demo control bar.
2. The system executes the drift scenario:
   - `Logging: Enabled → Disabled`
   - `Remote Access: Disabled → Enabled`
3. A modal immediately displays the autonomous 6-step pipeline reaction:
   - `1. CHANGE DETECTED`: 2 unauthorized parameter alterations.
   - `2. COMPLIANCE VIOLATION`: `RULE-002` (Syslog) FAIL & `RULE-003` (Remote Access) FAIL.
   - `3. AI RISK ANALYSIS`: Feature weights calculated $\rightarrow$ **Risk Score: 85 / 100**.
   - `4. RISK LEVEL`: Elevated to **HIGH RISK**.
   - `5. ALERT DISPATCHED`: High-severity alert sent to Security Operations Center.
   - `6. REMEDIATION GENERATED`: Accurate FortiOS CLI hardening script generated.

### Step 4: Verify Dashboard & Alerts Reaction
1. Notice the Dashboard counters updated immediately: High-Risk Devices incremented, Compliance Score decreased.
2. Navigate to the **Alerts** page to view the active incident:
   `HIGH: Fortinet-Edge-FW - Unauthorized configuration change detected`.
3. Click **Acknowledge** or **Resolve** to demonstrate incident lifecycle handling.

### Step 5: AI / ML Analysis & Interactive Sandbox
1. Navigate to the **AI / ML Analysis** page.
2. Explain the 7-dimension feature extractor and calibrated CIS impact weights.
3. Use the **Interactive AI Risk Simulator**:
   - Toggle Logging between `Enabled` and `Disabled`.
   - Toggle Remote Access between `Disabled` and `Enabled`.
   - Watch the numerical risk score and anomaly confidence update in real time.

### Step 6: Full Network Audit with Step-by-Step Progress
1. Click **[Run Full Audit]** in the top bar.
2. The animated progress modal appears, sequentially walking through:
   `Collecting data... → Checking configurations... → Detecting changes... → Analyzing risks... → Checking compliance... → Generating recommendations... → Audit completed.`

### Step 7: Generate Executive Audit Report
1. Navigate to the **Reports** page.
2. Review the 6 comprehensive sections (Executive Summary, Device Posture, Configuration Changes, Compliance Violations, Risk Assessment, Actionable Recommendations).
3. Click **Print / Save as PDF** to demonstrate formatted executive export readiness.

### Step 8: Reset Demo Data
1. Click **[Reset Demo Data]** to cleanly restore the 24 devices to their baseline state in a single click.

---

## 8. Where AI / ML is Used & Model Architecture

### Honesty & Transparency
The prototype implements a **transparent, deterministic multi-factor risk and anomaly scoring engine** (`backend/services/riskAnalyzer.js`). We deliberately do not claim that a black-box neural network is running locally when an explainable model is mathematically superior for compliance auditing.

### Mathematical Formulation
The analyzer extracts a 7-dimensional continuous feature vector:
$$\vec{f} = [f_{\text{remote}}, f_{\text{logging}}, f_{\text{auth}}, f_{\text{perimeter}}, f_{\text{compliance}}, f_{\text{crypto}}, f_{\text{drift}}]$$

Where:
- $f_{\text{remote}} \in \{0, 1\}$: Insecure remote access exposure (Telnet/HTTP)
- $f_{\text{logging}} \in \{0, 1\}$: Absence of centralized SIEM logging
- $f_{\text{auth}} \in \{0, 0.5, 1\}$: Credential complexity & password encryption level
- $f_{\text{perimeter}} \in \{0, 1\}$: Absence of default-deny inbound firewall rule
- $f_{\text{compliance}} \in [0, 1]$: Ratio of failed CIS benchmark controls
- $f_{\text{crypto}} \in [0, 1]$: Use of legacy cleartext protocols (SNMPv1/v2c)
- $f_{\text{drift}} \in [0, 1]$: Frequency of recent unauthorized parameter changes

The composite score is calculated using calibrated CIS impact weights:
$$\text{Risk Score} = \min\left(10 + \sum_{i} w_i \cdot f_i + C_{\text{compound}}, 98\right)$$

Where:
- $w_{\text{remote}} = 32$
- $w_{\text{logging}} = 26$
- $w_{\text{auth}} = 20$
- $w_{\text{perimeter}} = 14$
- $w_{\text{compliance}} = 12$
- $w_{\text{crypto}} = 8$
- $w_{\text{drift}} = 6$
- $C_{\text{compound}}$: Compound risk penalty applied when both logging is deactivated and remote access is permitted on perimeter hardware.

### Production ML Integration Path
The code is structured with an adapter factory (`riskAnalyzer.js` and `deviceAdapters.js`) so that production systems can easily replace the heuristic evaluation with:
1. **Supervised Classification (Random Forest / XGBoost)**: Trained on historical incident corpora to predict breach likelihood.
2. **Unsupervised Anomaly Detection (Isolation Forest)**: Identifying configuration outliers that deviate from an organization's golden baseline.
3. **ONNX Runtime / Python Microservice**: The `predictWithMLModel()` interface hook is documented and ready for external inference endpoints.

---

## 9. How Real Cisco / Fortinet / Palo Alto Hardware Integrations Are Added

The system uses the **Adapter Pattern** (`backend/services/deviceAdapters.js`) to decouple compliance and risk logic from vendor transport protocols:

```
[ Compliance Engine & AI Risk Analyzer ]
                   │
                   ▼
         [ DeviceAdapter Interface ]
      ┌────────────┬────────────┬────────────┐
      ▼            ▼            ▼            ▼
[ CiscoAdapter ] [ Fortinet ] [ PaloAlto ] [ Juniper ]
      │            │            │            │
      ▼            ▼            ▼            ▼
 SSH/RESTCONF   REST API     XML API     NETCONF/PyEZ
 (Port 22/443)  (Port 443)   (Port 443)  (Port 830)
      │            │            │            │
      ▼            ▼            ▼            ▼
[ Physical / Virtual Hardware Appliances ]
```

### Adding Live Connections in 3 Steps:

1. **Cisco Devices (IOS-XE / NX-OS)**:
   - Use Python's `Netmiko` or Node's `ssh2` library to connect to port 22:
     ```javascript
     const ssh = new SSHClient();
     await ssh.connect({ host: device.ip_address, username, password });
     const runningConfig = await ssh.exec("show running-config");
     ```
   - Alternatively, query the standard IETF RESTCONF API (`GET https://{ip}/restconf/data/ietf-interfaces:interfaces`).

2. **Fortinet Firewalls (FortiOS)**:
   - Query the official FortiOS REST API:
     ```javascript
     const res = await fetch(`https://${device.ip_address}/api/v2/cmdb/system/global`, {
       headers: { Authorization: `Bearer ${apiToken}` }
     });
     ```

3. **Palo Alto Firewalls (PAN-OS)**:
   - Query the PAN-OS XML API:
     ```javascript
     const url = `https://${device.ip_address}/api/?type=config&action=get&xpath=/config/shared`;
     ```

4. **Juniper Networks (JunOS)**:
   - Connect via JunOS PyEZ or standard NETCONF over SSH (RFC 6241) on port 830.

Because the system parses output into uniform JSON attributes (`logging`, `remote_access`, `password_policy`, etc.), **zero changes to the Compliance Engine, AI Risk Analyzer, or Dashboard are required** when connecting to live devices.

---

## 10. REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticates administrator and returns JWT token |
| `GET` | `/api/auth/me` | Returns active user profile |
| `GET` | `/api/dashboard` | Returns summary cards, 4 chart datasets, recent changes, and alerts |
| `GET` | `/api/devices` | Lists devices with filters (`vendor`, `risk_level`, `search`) |
| `GET` | `/api/devices/:id` | Returns device details, current/previous config, and compliance checks |
| `POST` | `/api/devices` | Registers a new network hardware node |
| `POST` | `/api/devices/:id/audit` | Executes an audit on a single device |
| `GET` | `/api/devices/:id/configuration` | Returns side-by-side structured configuration diff |
| `GET` | `/api/changes` | Lists configuration changes with authorization filters |
| `POST` | `/api/changes/simulate` | Simulates configuration drift on a device |
| `GET` | `/api/compliance` | Returns 8 CIS benchmark rules and compliance statistics |
| `GET` | `/api/risk` | Returns fleet risk metrics and feature importance weights |
| `GET` | `/api/risk/assessments` | Returns device risk rankings with detected problems and remediations |
| `POST` | `/api/risk/simulate` | Interactive AI sandbox calculation endpoint |
| `GET` | `/api/alerts` | Lists security alerts with severity filters |
| `PATCH` | `/api/alerts/:id/acknowledge`| Acknowledges an active alert |
| `PATCH` | `/api/alerts/:id/resolve` | Resolves an alert |
| `POST` | `/api/audit/run` | Executes an audit across all 24 devices |
| `GET` | `/api/reports` | Returns report history |
| `POST` | `/api/reports/generate` | Compiles formal 6-section audit report |
| `POST` | `/api/demo/scenario-fortinet` | Triggers the exact SIH Fortinet drift demonstration scenario |
| `POST` | `/api/demo/reset` | Resets database back to clean baseline state |
