import express from 'express';
import db from '../database/db';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT t.*, s.seed_name, s.manufacturer, u.username as farmer_name
      FROM transactions t
      LEFT JOIN seeds s ON t.seed_id = s.seed_id
      LEFT JOIN users u ON t.farmer_id = u.id
      ORDER BY t.timestamp DESC
    `).all();
    res.json({ status: "success", transactions });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
