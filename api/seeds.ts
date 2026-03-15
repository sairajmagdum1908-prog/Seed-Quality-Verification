import express from 'express';
import { query, initDb } from './lib/db';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const ensureDb = async () => {
  await initDb();
};

const router = express.Router();

router.get('/', async (req, res) => {
  await ensureDb();
  try {
    const result = await query('SELECT * FROM seeds ORDER BY production_date DESC');
    res.json({ success: true, seeds: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  await ensureDb();
  const { seed_name, manufacturer, batch_number, production_date, expiry_date } = req.body;
  
  try {
    // Get previous hash
    const lastSeedResult = await query('SELECT verification_hash FROM seeds ORDER BY production_date DESC LIMIT 1');
    const previous_hash = lastSeedResult.rows[0] ? lastSeedResult.rows[0].verification_hash : '0'.repeat(64);
    
    const timestamp = new Date().toISOString();
    const dataToHash = `${seed_name}${manufacturer}${batch_number}${timestamp}${previous_hash}`;
    const verification_hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    
    const seed_id = uuidv4();
    
    await query(`
      INSERT INTO seeds (seed_id, seed_name, manufacturer, batch_number, production_date, expiry_date, verification_hash, previous_hash, id, hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [seed_id, seed_name, manufacturer, batch_number, production_date, expiry_date, verification_hash, previous_hash, seed_id, verification_hash]);
    
    res.json({ 
      success: true,
      seed: {
        seed_id, 
        seed_name, 
        manufacturer, 
        batch_number, 
        verification_hash,
        qr_data: JSON.stringify({ id: seed_id, batch_number, manufacturer, hash: verification_hash })
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/verify-seed/:id', async (req, res) => {
  await ensureDb();
  const { id } = req.params;
  const { location, user_id } = req.query;
  
  try {
    const seedResult = await query('SELECT * FROM seeds WHERE seed_id = $1', [id]);
    const seed = seedResult.rows[0];
    
    if (!seed) return res.status(404).json({ success: false, message: 'Seed not found' });
    
    // Fraud Detection Logic
    const recentScansResult = await query(`
      SELECT COUNT(DISTINCT scan_location) as loc_count 
      FROM scans 
      WHERE seed_id = $1 AND scan_time > NOW() - INTERVAL '1 hour'
    `, [id]);
    
    let is_fraudulent = 0;
    if (parseInt(recentScansResult.rows[0].loc_count) >= 10) {
      is_fraudulent = 1;
    }
    
    const reportCountResult = await query('SELECT COUNT(*) as count FROM reports WHERE seed_id = $1', [id]);
    if (parseInt(reportCountResult.rows[0].count) >= 3) {
      is_fraudulent = 1;
    }
    
    await query('INSERT INTO scans (seed_id, user_id, scan_location, is_fraudulent) VALUES ($1, $2, $3, $4)', 
      [id, user_id || null, (location as string) || 'Unknown', is_fraudulent]);
    
    if (user_id) {
      await query('INSERT INTO transactions (seed_id, farmer_id) VALUES ($1, $2)', [id, user_id]);
      if (!is_fraudulent) {
        await query('UPDATE users SET points = points + 10 WHERE id = $1', [user_id]);
      }
    }
    
    res.json({ success: true, seed, is_fraudulent: !!is_fraudulent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/user-scans/:user_id', async (req, res) => {
  await ensureDb();
  const { user_id } = req.params;
  try {
    const result = await query(`
      SELECT s.scan_id as id, s.*, sd.seed_name, sd.manufacturer 
      FROM scans s
      JOIN seeds sd ON s.seed_id = sd.seed_id
      WHERE s.user_id = $1
      ORDER BY s.scan_time DESC
    `, [user_id]);
    res.json({ success: true, scans: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/seed-history/:seed_id', async (req, res) => {
  await ensureDb();
  const { seed_id } = req.params;
  try {
    const result = await query(`
      SELECT * FROM scans 
      WHERE seed_id = $1 
      ORDER BY scan_time DESC
    `, [seed_id]);
    res.json({ success: true, scans: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/manufacturer-seeds/:manufacturer', async (req, res) => {
  await ensureDb();
  const { manufacturer } = req.params;
  try {
    const result = await query('SELECT * FROM seeds WHERE manufacturer = $1 ORDER BY production_date DESC', [manufacturer]);
    res.json({ success: true, seeds: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/recall-seed/:id', async (req, res) => {
  await ensureDb();
  const { id } = req.params;
  try {
    await query('UPDATE seeds SET is_recalled = 1 WHERE seed_id = $1', [id]);
    res.json({ success: true, message: 'Seed batch recalled successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
