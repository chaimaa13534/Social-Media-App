/**
 * Auth Controller — register / login / me
 */
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

exports.register = async (req, res, next) => {
  try {
    const { username, email, password, full_name } = req.body;

    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return res.status(400).json({ success: false, message: 'Username must be 3-30 alphanumeric chars or underscores' });
    }

    if (await User.findByEmail(email)) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }
    if (await User.findByUsername(username)) {
      return res.status(409).json({ success: false, message: 'Username already taken' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const id     = await User.create({ username, email, password: hashed, full_name });
    const token  = signToken(id);
    const user   = await User.findById(id);

    res.status(201).json({ success: true, token, user });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token   = signToken(user.id);
    const profile = await User.findById(user.id);

    res.json({ success: true, token, user: profile });
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};
