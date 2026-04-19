const jwt = require('jsonwebtoken');
const { getPrisma, getDbInitError } = require('../config/db');

const register = async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const prisma = getPrisma();
    const { username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email ? 'Email already exists' : 'Username already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword }
    });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Registration error:', error);

    const dbInitError = getDbInitError();
    if (dbInitError) {
      return res.status(500).json({ success: false, error: `Database client failed to initialize: ${dbInitError.message}` });
    }

    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
};

const login = async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const prisma = getPrisma();
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);

    const dbInitError = getDbInitError();
    if (dbInitError) {
      return res.status(500).json({ success: false, error: `Database client failed to initialize: ${dbInitError.message}` });
    }

    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
};

const getUser = (req, res) => {
  if (req.user) {
    return res.json({ success: true, isAuthenticated: true, user: req.user });
  }
  res.json({ success: true, isAuthenticated: false, user: null });
};

module.exports = { register, login, getUser };