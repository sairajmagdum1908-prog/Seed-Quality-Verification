import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Correct database path
const dbPath = path.join(process.cwd(), 'blockchain_ledger.db');

const db = new Database(dbPath);
console.log("Database connected:", dbPath);

// Create tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT,
  points INTEGER DEFAULT 0,
  name TEXT,
  phone TEXT,
  location TEXT,
  language TEXT DEFAULT 'English',
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS seeds (
  seed_id TEXT PRIMARY KEY,
  seed_name TEXT,
  manufacturer TEXT,
  batch_number TEXT,
  production_date TEXT,
  expiry_date TEXT,
  verification_hash TEXT,
  previous_hash TEXT,
  is_recalled INTEGER DEFAULT 0,
  -- Keep old names as aliases for compatibility if needed
  id TEXT,
  hash TEXT
);

CREATE TABLE IF NOT EXISTS transactions (
  transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
  seed_id TEXT,
  farmer_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scans (
  scan_id INTEGER PRIMARY KEY AUTOINCREMENT,
  seed_id TEXT,
  scanned_by INTEGER,
  scan_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  result TEXT,
  -- Keep old names for compatibility during transition if needed
  id INTEGER,
  user_id INTEGER,
  scan_location TEXT,
  is_fraudulent INTEGER DEFAULT 0,
  FOREIGN KEY(scanned_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seed_id TEXT,
  user_id INTEGER,
  issue TEXT,
  location TEXT,
  status TEXT DEFAULT 'pending',
  reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);
`);

// Automatically create a default admin user when the server starts
const adminExists = db
  .prepare("SELECT * FROM users WHERE username = ?")
  .get("admin");

if (!adminExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare(
    "INSERT INTO users (username,password,role) VALUES (?,?,?)"
  ).run("admin", hashedPassword, "admin");

  console.log("Default admin user created");
}

// Debug: Log users in database
try {
  const users = db.prepare("SELECT id, username, role FROM users").all();
  console.log("Current users:", users);
} catch (e: any) {
  console.log("Error querying users table:", e.message);
}

export default db;
