import express from 'express';
import db from '../database/db';

const router = express.Router();

router.post('/report-fake', (req, res) => {
  const { seed_id, user_id, issue, location } = req.body;
  console.log(`Report fake request received for seed: ${seed_id} by user: ${user_id}`);
  
  try {
    db.prepare('INSERT INTO reports (seed_id, user_id, issue, location) VALUES (?, ?, ?, ?)').run(seed_id, user_id, issue, location);
    
    // Reward points for reporting
    if (user_id) {
      db.prepare('UPDATE users SET points = points + 50 WHERE id = ?').run(user_id);
    }
    
    res.json({ status: "success", message: 'Report submitted. You earned 50 Trust Points!' });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post('/resolve-report/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare("UPDATE reports SET status = 'resolved' WHERE id = ?").run(id);
    res.json({ status: "success", message: 'Report marked as resolved' });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.get('/all-reports', (req, res) => {
  try {
    const reports = db.prepare(`
      SELECT r.*, s.seed_name, s.manufacturer, u.username as farmer_name
      FROM reports r
      JOIN seeds s ON r.seed_id = s.seed_id
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.reported_at DESC
    `).all();
    res.json({ status: "success", reports });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
