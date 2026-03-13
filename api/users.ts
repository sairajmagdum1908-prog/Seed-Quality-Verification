import express from 'express';
import { query, initDb } from './lib/db';
import bcrypt from 'bcryptjs';

const ensureDb = async () => {
  await initDb();
};

const router = express.Router();

router.get('/all-users', async (req, res) => {
  await ensureDb();
  try {
    const result = await query('SELECT id, username, role, points, name, phone, location, status FROM users ORDER BY id DESC');
    res.json({ success: true, users: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/update-status/:id', async (req, res) => {
  await ensureDb();
  const { id } = req.params;
  const { status } = req.body;
  try {
    await query('UPDATE users SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true, message: 'User status updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/update-role/:id', async (req, res) => {
  await ensureDb();
  const { id } = req.params;
  const { role } = req.body;
  try {
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
    res.json({ success: true, message: 'User role updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/reset-password/:id', async (req, res) => {
  await ensureDb();
  const { id } = req.params;
  const { newPassword } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/delete-user/:id', async (req, res) => {
  await ensureDb();
  const { id } = req.params;
  try {
    await query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/update-profile/:id', async (req, res) => {
  await ensureDb();
  const { id } = req.params;
  const { name, phone, location, language } = req.body;
  try {
    await query(`
      UPDATE users 
      SET name = $1, phone = $2, location = $3, language = $4 
      WHERE id = $5
    `, [name, phone, location, language, id]);
    res.json({ success: true, message: 'Profile updated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
