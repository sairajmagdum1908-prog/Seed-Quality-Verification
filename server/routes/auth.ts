import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/db';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  
  if (!username || !password || !role) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username, password, and role are required' 
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const info = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run(username, hashedPassword, role);
    
    const user = { 
      id: info.lastInsertRowid, 
      username, 
      role, 
      points: 0 
    };

    res.json({ 
      success: true, 
      message: 'Registration successful', 
      user 
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error during registration' 
      });
    }
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }

  try {
    // Case-insensitive lookup using LOWER()
    const user: any = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?)').get(username);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid Username or Password' 
      });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid Username or Password' 
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      success: true, 
      message: 'Login successful', 
      user: userWithoutPassword 
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error during login' 
    });
  }
});

export default router;
