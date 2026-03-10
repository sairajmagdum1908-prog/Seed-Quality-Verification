import express from 'express';
import crypto from 'crypto';
import db from '../database/db';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.post('/add-seed', (req, res) => {
  const { seed_name, manufacturer, batch_number, production_date } = req.body;
  
  try {
    // Get previous hash
    const lastSeed: any = db.prepare('SELECT hash FROM seeds ORDER BY ROWID DESC LIMIT 1').get();
    const previous_hash = lastSeed ? lastSeed.hash : '0'.repeat(64);
    
    const timestamp = new Date().toISOString();
    const dataToHash = `${seed_name}${manufacturer}${batch_number}${timestamp}${previous_hash}`;
    const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');
    
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO seeds (id, seed_name, manufacturer, batch_number, production_date, hash, previous_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, seed_name, manufacturer, batch_number, production_date, hash, previous_hash);
    
    res.json({ 
      id, 
      seed_name, 
      manufacturer, 
      batch_number, 
      hash,
      qr_data: JSON.stringify({ id, batch_number, manufacturer, hash })
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/verify-seed/:id', (req, res) => {
  const { id } = req.params;
  const { location } = req.query;
  
  try {
    const seed: any = db.prepare('SELECT * FROM seeds WHERE id = ?').get(id);
    if (!seed) return res.status(404).json({ success: false, message: 'Seed not found' });
    
    // Fraud Detection Logic
    // Check if scanned more than 10 times in different locations within short time
    const recentScans: any = db.prepare(`
      SELECT COUNT(DISTINCT scan_location) as loc_count 
      FROM scans 
      WHERE seed_id = ? AND scan_time > datetime('now', '-1 hour')
    `).get(id);
    
    let is_fraudulent = 0;
    if (recentScans.loc_count >= 10) {
      is_fraudulent = 1;
    }
    
    // Check if multiple fake reports exist
    const reportCount: any = db.prepare('SELECT COUNT(*) as count FROM reports WHERE seed_id = ?').get(id);
    if (reportCount.count >= 3) {
      is_fraudulent = 1;
    }
    
    db.prepare('INSERT INTO scans (seed_id, scan_location, is_fraudulent) VALUES (?, ?, ?)').run(id, location || 'Unknown', is_fraudulent);
    
    res.json({ seed, is_fraudulent: !!is_fraudulent });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/seed-history/:id', (req, res) => {
  const { id } = req.params;
  try {
    const scans = db.prepare('SELECT * FROM scans WHERE seed_id = ? ORDER BY scan_time DESC').all(id);
    res.json({ scans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
