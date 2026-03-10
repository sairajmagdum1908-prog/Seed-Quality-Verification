import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/db';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const info = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hashedPassword, role);
    const user = { id: info.lastInsertRowid, username, role, points: 0 };
    res.json({ success: true, user });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ success: false, error: 'Username already exists' });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Case-insensitive lookup using LOWER()
    const user: any = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(username);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid Username or Password' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid Username or Password' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
