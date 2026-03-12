import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL is not defined. Database connection will fail.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  let retries = 3;
  while (retries > 0) {
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error: any) {
      retries--;
      console.error(`Query error (retries left: ${retries})`, { text, error: error.message });
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
    }
  }
  throw new Error('Query failed after retries');
};

34 }
35 let dbInitialized = false;
36 let dbInitializationPromise: Promise<void> | null = null;

37 export const initDb = async () => {
38   if (dbInitialized) return;
39   if (dbInitializationPromise) return dbInitializationPromise;

  dbInitializationPromise = (async () => {
    console.log('Initializing database...');
    try {
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
      
      // Check if admin exists, if not create one
      const adminCheck = await query('SELECT * FROM users WHERE role = $1', ['admin']);
      if (adminCheck.rowCount === 0) {
        const bcrypt = await import('bcryptjs');
        const hashedPassword = bcrypt.default.hashSync('admin123', 10);
        await query(
          'INSERT INTO users (username, password, role, name) VALUES ($1, $2, $3, $4)',
          ['admin', hashedPassword, 'admin', 'System Administrator']
        );
        console.log('Default admin created: admin / admin123');
      }

      dbInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Database initialization failed', error);
      dbInitializationPromise = null; // Allow retry on next call
      throw error;
    }
  })();

  return dbInitializationPromise;
};

export default pool;
