import express from 'express';
import db from '../database/db';

const router = express.Router();

router.post('/report-fake', (req, res) => {
  const { seed_id, farmer_id, report_reason } = req.body;
  
  try {
    db.prepare('INSERT INTO reports (seed_id, farmer_id, report_reason) VALUES (?, ?, ?)').run(seed_id, farmer_id, report_reason);
    
    // Reward points for reporting
    db.prepare('UPDATE users SET points = points + 50 WHERE id = ?').run(farmer_id);
    
    res.json({ success: true, message: 'Report submitted. You earned 50 Trust Points!' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/all-reports', (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT r.*, u.username as farmer_name, s.seed_name, s.manufacturer 
      FROM reports r
      JOIN users u ON r.farmer_id = u.id
      JOIN seeds s ON r.seed_id = s.id
      ORDER BY r.report_date DESC
    `).all();
    res.json({ success: true, reports });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
