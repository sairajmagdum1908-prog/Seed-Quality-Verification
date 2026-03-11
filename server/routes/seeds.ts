import express from 'express';
import crypto from 'crypto';
import db from '../database/db';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/add', (req, res) => {
  const { seed_name, manufacturer, batch_number, production_date, expiry_date } = req.body;
  console.log(`Add seed request received: ${seed_name} by ${manufacturer}`);
  
  try {
    // Get previous hash
    const lastSeed: any = db.prepare('SELECT verification_hash FROM seeds ORDER BY ROWID DESC LIMIT 1').get();
    const previous_hash = lastSeed ? lastSeed.verification_hash : '0'.repeat(64);
    
    const timestamp = new Date().toISOString();
    const dataToHash = `${seed_name}${manufacturer}${batch_number}${timestamp}${previous_hash}`;
    const verification_hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    
    const seed_id = uuidv4();
    
    db.prepare(`
      INSERT INTO seeds (seed_id, seed_name, manufacturer, batch_number, production_date, expiry_date, verification_hash, previous_hash, id, hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(seed_id, seed_name, manufacturer, batch_number, production_date, expiry_date, verification_hash, previous_hash, seed_id, verification_hash);
    
    res.json({ 
      status: "success",
      seed_id, 
      seed_name, 
      manufacturer, 
      batch_number, 
      verification_hash,
      id: seed_id,
      hash: verification_hash,
      qr_data: JSON.stringify({ id: seed_id, batch_number, manufacturer, hash: verification_hash })
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Alias for add-seed
router.post('/add-seed', (req, res) => {
  res.redirect(307, '/api/seeds/add');
});

router.get('/', (req, res) => {
  try {
    const seeds = db.prepare('SELECT * FROM seeds ORDER BY ROWID DESC').all();
    res.json({ status: "success", seeds });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get('/manufacturer-seeds/:manufacturer', (req, res) => {
  const { manufacturer } = req.params;
  try {
    const seeds = db.prepare('SELECT * FROM seeds WHERE manufacturer = ? ORDER BY ROWID DESC').all(manufacturer);
    res.json({ status: "success", seeds });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post('/recall-seed/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('UPDATE seeds SET is_recalled = 1 WHERE seed_id = ?').run(id);
    res.json({ status: "success", message: 'Seed batch recalled successfully' });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get('/verify-seed/:id', (req, res) => {
  const { id } = req.params;
  const { location, user_id } = req.query;
  console.log(`Verify seed request received for ID: ${id} at location: ${location} by user: ${user_id}`);
  
  try {
    const seed: any = db.prepare('SELECT * FROM seeds WHERE seed_id = ?').get(id);
    if (!seed) return res.status(404).json({ status: "error", message: 'Seed not found' });
    
    // Fraud Detection Logic
    const recentScans: any = db.prepare(`
      SELECT COUNT(DISTINCT scan_location) as loc_count 
      FROM scans 
      WHERE seed_id = ? AND scan_time > datetime('now', '-1 hour')
    `).get(id);
    
    let is_fraudulent = 0;
    if (recentScans.loc_count >= 10) {
      is_fraudulent = 1;
    }
    
    const reportCount: any = db.prepare('SELECT COUNT(*) as count FROM reports WHERE seed_id = ?').get(id);
    if (reportCount.count >= 3) {
      is_fraudulent = 1;
    }
    
    db.prepare('INSERT INTO scans (seed_id, user_id, scan_location, is_fraudulent) VALUES (?, ?, ?, ?)').run(id, user_id || null, location || 'Unknown', is_fraudulent);
    
    // Create a transaction record
    if (user_id) {
      db.prepare('INSERT INTO transactions (seed_id, farmer_id) VALUES (?, ?)').run(id, user_id);
    }

    // Award points if genuine and user_id provided
    if (!is_fraudulent && user_id) {
      db.prepare('UPDATE users SET points = points + 10 WHERE id = ?').run(user_id);
    }
    
    res.json({ status: "success", seed, is_fraudulent: !!is_fraudulent });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get('/user-scans/:user_id', (req, res) => {
  const { user_id } = req.params;
  try {
    const scans = db.prepare(`
      SELECT s.*, sd.seed_name, sd.manufacturer 
      FROM scans s
      JOIN seeds sd ON s.seed_id = sd.id
      WHERE s.user_id = ?
      ORDER BY s.scan_time DESC
    `).all(user_id);
    res.json({ status: "success", scans });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get('/seed-history/:id', (req, res) => {
  const { id } = req.params;
  try {
    const scans = db.prepare('SELECT * FROM scans WHERE seed_id = ? ORDER BY scan_time DESC').all(id);
    res.json({ status: "success", scans });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get('/transactions', (req, res) => {
  try {
    const transactions = db.prepare('SELECT * FROM transactions ORDER BY timestamp DESC').all();
    res.json({ status: "success", transactions });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
