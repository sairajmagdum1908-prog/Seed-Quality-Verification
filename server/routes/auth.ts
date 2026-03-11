import express from 'express';
import db from '../database/db';

const router = express.Router();

router.post('/register', (req, res) => {
  const { username, password, role } = req.body;
  console.log(`Signup request received for user: ${username}`);
  
  if (!username || !password || !role) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username, password, and role are required' 
    });
  }

  try {
    const stmt = db.prepare(
      "INSERT INTO users (username,password,role) VALUES (?,?,?)"
    );

    stmt.run(username, password, role);

    res.json({ 
      success: true,
      message: "User registered successfully" 
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
      success: false, 
      message: 'Username and password are required' 
    });
  }

  try {
    const user: any = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Username not found" 
      });
    }

    if (user.password !== password) {
      return res.status(401).json({ 
        success: false,
        message: "Incorrect password" 
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ 
      success: true, 
      message: "Login successful", 
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
