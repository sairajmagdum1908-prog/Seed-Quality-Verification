import express from 'express';
import db from '../database/db';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/register', (req, res) => {
  const { username, password, role } = req.body;
  console.log(`Signup request received for user: ${username}`);
  
  if (!username || !password || !role) {
    return res.status(400).json({ 
      status: "error", 
      message: 'Username, password, and role are required' 
    });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(
      "INSERT INTO users (username,password,role) VALUES (?,?,?)"
    );

    const result = stmt.run(username, hashedPassword, role);
    const newUser = { id: result.lastInsertRowid, username, role, points: 0 };

    res.json({ 
      status: "success",
      message: "User registered successfully",
      user: newUser
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ 
        status: "error", 
        message: 'Username already exists' 
      });
    } else {
      res.status(500).json({ 
        status: "error",
        message: "Registration failed" 
      });
    }
  }
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`Login request received for user: ${username}`);

  if (!username || !password) {
    return res.status(400).json({ 
      status: "error", 
      message: 'Username and password are required' 
    });
  }

  try {
    const user: any = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);

    if (!user) {
      return res.status(401).json({ 
        status: "error",
        message: "Invalid username or password" 
      });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        status: "error",
        message: "Invalid username or password" 
      });
    }

    res.json({ 
      status: "success", 
      role: user.role,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        points: user.points
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      status: "error", 
      message: 'Internal server error during login' 
    });
  }
});

export default router;
