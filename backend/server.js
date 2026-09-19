import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/authRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";
import configRoutes from "./routes/configRoutes.js";
import changeRoutes from "./routes/changeRoutes.js";
import complianceRoutes from "./routes/complianceRoutes.js";
import riskRoutes from "./routes/riskRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import demoRoutes from "./routes/demoRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger for audit trails
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api", configRoutes);
app.use("/api/changes", changeRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/risk", riskRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/demo", demoRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "AI-Driven Multi-Vendor Network Security Compliance Auditor",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`🚀 Network Compliance Auditor Backend running on port ${PORT}`);
  console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
  console.log(`🔐 Admin credentials: admin@example.com / Admin@123`);
  console.log(`========================================================`);
});
