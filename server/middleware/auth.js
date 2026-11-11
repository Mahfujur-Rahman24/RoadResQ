const jwt = require('jsonwebtoken');
const User = require('../models/User');
exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Please sign in to continue.' });
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET || 'change-this-development-secret');
    const user = await User.findById(decoded.id);
    if (!user || !user.active) return res.status(401).json({ message: 'Account is unavailable.' });
    req.user = user; next();
  } catch { return res.status(401).json({ message: 'Invalid or expired session.' }); }
};
exports.allowRoles = (...roles) => (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You do not have permission to do this.' });
