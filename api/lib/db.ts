import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
};

export const initDb = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
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
      id TEXT,
      hash TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      transaction_id SERIAL PRIMARY KEY,
      seed_id TEXT,
      farmer_id INTEGER,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scans (
      scan_id SERIAL PRIMARY KEY,
      seed_id TEXT,
      scanned_by INTEGER,
      scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      result TEXT,
      user_id INTEGER,
      scan_location TEXT,
      is_fraudulent INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      seed_id TEXT,
      user_id INTEGER,
      issue TEXT,
      location TEXT,
      status TEXT DEFAULT 'pending',
      reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export default pool;
