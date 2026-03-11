import express from 'express';
import db from '../database/db';

const router = express.Router();

router.get('/all-users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, role, points, name, phone, location, language, status FROM users').all();
    res.json({ status: "success", users });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post('/update-profile/:id', (req, res) => {
  const { id } = req.params;
  const { name, phone, location, language } = req.body;
  try {
    db.prepare(`
      UPDATE users 
      SET name = ?, phone = ?, location = ?, language = ? 
      WHERE id = ?
    `).run(name, phone, location, language, id);
    
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.json({ status: "success", user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post('/update-role/:id', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
    res.json({ status: "success", message: `User role updated to ${role}` });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post('/update-status/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
    res.json({ status: "success", message: `User status updated to ${status}` });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post('/reset-password/:id', (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  try {
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, id);
    res.json({ status: "success", message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.delete('/delete-user/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ status: "success", message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

router.post('/change-password/:id', (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = (db.prepare('SELECT password FROM users WHERE id = ?').get(id)) as any;
    if (!user || user.password !== oldPassword) {
      return res.status(400).json({ status: "error", message: 'Incorrect current password' });
    }
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, id);
    res.json({ status: "success", message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
