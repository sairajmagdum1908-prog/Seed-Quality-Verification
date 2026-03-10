import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'blockchain_ledger.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('farmer', 'manufacturer', 'admin')),
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
    is_fraudulent INTEGER DEFAULT 0,
    FOREIGN KEY(seed_id) REFERENCES seeds(id)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seed_id TEXT,
    farmer_id INTEGER,
    report_reason TEXT,
    report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(seed_id) REFERENCES seeds(id),
    FOREIGN KEY(farmer_id) REFERENCES users(id)
  );
`);

export default db;
