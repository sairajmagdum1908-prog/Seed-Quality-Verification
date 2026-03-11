import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Correct database path
const dbPath = path.join(__dirname, '../../blockchain_ledger.db');

const db = new Database(dbPath);
console.log("Database connected:", dbPath);

// Create tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT,
  points INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS seeds (
  id TEXT PRIMARY KEY,
  seed_name TEXT,
  manufacturer TEXT,
  batch_number TEXT,
  production_date TEXT,
  hash TEXT,
  previous_hash TEXT,
  is_recalled INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seed_id TEXT,
  scan_location TEXT,
  scan_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_fraudulent INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seed_id TEXT,
  issue TEXT,
  reported_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

// Automatically create a default admin user when the server starts
const adminExists = db
  .prepare("SELECT * FROM users WHERE username = ?")
  .get("admin");

if (!adminExists) {
  db.prepare(
    "INSERT INTO users (username,password,role) VALUES (?,?,?)"
  ).run("admin", "admin123", "admin");

  console.log("Default admin user created");
}

// Debug: Log users in database
try {
  const users = db.prepare("SELECT * FROM users").all();
  console.log("Current users:", users);
} catch (e: any) {
  console.log("Error querying users table:", e.message);
}

export default db;
