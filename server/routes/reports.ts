import express from 'express';
import db from '../database/db';

const router = express.Router();

router.post('/report-fake', (req, res) => {
  const { seed_id, farmer_id, issue } = req.body;
  console.log(`Report fake request received for seed: ${seed_id}`);
  
  try {
    db.prepare('INSERT INTO reports (seed_id, issue) VALUES (?, ?)').run(seed_id, issue);
    
    // Reward points for reporting if farmer_id is provided
    if (farmer_id) {
      db.prepare('UPDATE users SET points = points + 50 WHERE id = ?').run(farmer_id);
    }
    
    res.json({ success: true, message: 'Report submitted. You earned 50 Trust Points!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/all-reports', (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT r.*, s.seed_name, s.manufacturer 
      FROM reports r
      JOIN seeds s ON r.seed_id = s.id
      ORDER BY r.reported_at DESC
    `).all();
    res.json({ success: true, reports });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
