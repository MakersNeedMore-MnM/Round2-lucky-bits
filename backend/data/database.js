import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "network_auditor.db");

const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys for performance and integrity
try {
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
} catch (e) {
  console.warn("Pragma warning:", e.message);
}

export function query(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

export function get(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.get(...params);
}

export function run(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

export function exec(sql) {
  return db.exec(sql);
}

export default {
  query,
  get,
  run,
  exec,
  dbInstance: db
};
