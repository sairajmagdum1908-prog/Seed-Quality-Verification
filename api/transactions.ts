import express from 'express';
import { query, initDb } from './lib/db';

const ensureDb = async () => {
  await initDb();
};

const router = express.Router();

router.get('/', async (req, res) => {
  await ensureDb();
  try {
    const result = await query(`
      SELECT t.*, s.seed_name, u.username as farmer_name 
      FROM transactions t
      JOIN seeds s ON t.seed_id = s.seed_id
      JOIN users u ON t.farmer_id = u.id
      ORDER BY t.timestamp DESC
    `);
    res.json({ success: true, transactions: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
