import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

let dbInitialized = false;

export const initDb = async () => {
  if (dbInitialized) return;
  try {
    await pool.query("SELECT 1");
    console.log("Database connected successfully");

    // Ensure tables exist
    await pool.query(`
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
    
    // Create default users if they don't exist
    const adminCheck = await pool.query('SELECT * FROM users WHERE username = $1', ['admin']);
    if (adminCheck.rowCount === 0) {
      const bcrypt = await import('bcryptjs');
      const hashedPassword = bcrypt.default.hashSync('admin123', 10);
      await pool.query(
        'INSERT INTO users (username, password, role, name) VALUES ($1, $2, $3, $4)',
        ['admin', hashedPassword, 'admin', 'System Administrator']
      );
      console.log('Default admin created');
    }

    dbInitialized = true;
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Database connection/initialization failed:", err);
    throw err;
  }
};

export default pool;
