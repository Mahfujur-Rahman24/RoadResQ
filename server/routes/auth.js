const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    responderType: user.responderType || '',
    organization: user.organization || ''
  };
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'change-this-development-secret',
    { expiresIn: '12h' }
  );
}

// Public self-registration is limited to responder and hospital accounts.
// Admin accounts must be created by a trusted administrator.
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, organization, responderType } = req.body;
    if (!name || !email || !password || !role || !organization) {
      return res.status(400).json({ message: 'Name, email, password, account type and organization are required.' });
    }
    if (!['responder', 'hospital'].includes(role)) {
      return res.status(400).json({ message: 'Only responder and hospital accounts can register here.' });
    }
    if (String(name).trim().length < 2 || String(organization).trim().length < 2) {
      return res.status(400).json({ message: 'Name and organization must contain at least 2 characters.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(String(email).trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }
    if (role === 'responder' && !['ambulance', 'police', 'fire'].includes(responderType)) {
      return res.status(400).json({ message: 'Please select a responder service type.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists. Please sign in instead.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      responderType: role === 'responder' ? responderType : '',
      organization: String(organization).trim(),
      active: true
    });

    return res.status(201).json({
      message: 'Account created successfully. Your information is saved in MongoDB.',
      token: signToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'This email is already registered.' });
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Could not create the account. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: 'Email, password and portal are required.' });
    const user = await User.findOne({ email: email.toLowerCase().trim(), role }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email, password or portal.' });
    }
    if (!user.active) return res.status(403).json({ message: 'This account is currently disabled.' });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Could not sign in. Please try again.' });
  }
});

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));
module.exports = router;
