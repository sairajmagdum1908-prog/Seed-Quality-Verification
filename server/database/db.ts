import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '../../blockchain_ledger.db');
let db: any;

try {
  db = new Database(dbPath);
  console.log("Database connected at:", dbPath);
} catch (error) {
  console.error("Failed to connect to database:", error);
  process.exit(1);
}

// Create tables
try {
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
  console.log('Database tables initialized successfully.');
} catch (error) {
  console.error('Error initializing database tables:', error);
}

export default db;
