import express from 'express';
import bcrypt from 'bcryptjs';
import { query, initDb } from './lib/db';
import { generateToken } from './lib/auth';

const ensureDb = async () => {
  await initDb();
};

const router = express.Router();

router.post('/register', async (req, res) => {
  await ensureDb();
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = await query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hashedPassword, role]
    );
    
    const user = result.rows[0];
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error: any) {
    console.error('Register error:', error);
    if (error.code === '23505') { // Postgres unique violation
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  await ensureDb();
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing credentials' });
  }

  try {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Username not found' });
    }

    if (!user.password) {
      return res.status(500).json({ success: false, message: 'Password field missing in database' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const token = generateToken(user);
    
    // Don't send password back
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
