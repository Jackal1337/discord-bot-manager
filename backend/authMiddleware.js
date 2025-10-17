const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('./db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const JWT_EXPIRES_IN = '7d'; // Token platný 7 dní

// Generovat JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Middleware: Ověřit JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Chybí autentifikační token'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Neplatný nebo expirovaný token'
      });
    }

    req.user = user; // Přidat user info do requestu
    next();
  });
}

// Login handler
async function loginHandler(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username a password jsou povinné'
    });
  }

  try {
    // Najít uživatele v databázi
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Neplatné přihlašovací údaje'
      });
    }

    // Ověřit heslo
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Neplatné přihlašovací údaje'
      });
    }

    // Generovat JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Přihlášení úspěšné',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Chyba při přihlašování'
    });
  }
}

// Vytvořit prvního uživatele (pomocný script)
async function createUser(username, password) {
  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      console.log('⚠️ Uživatel již existuje');
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password_hash });
    console.log(`✅ Uživatel "${username}" vytvořen (ID: ${user.id})`);
  } catch (error) {
    console.error('❌ Chyba při vytváření uživatele:', error);
  }
}

module.exports = {
  authenticateToken,
  loginHandler,
  createUser
};
