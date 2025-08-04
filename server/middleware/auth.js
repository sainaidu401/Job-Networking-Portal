const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing or malformed' });
    }

    const token = authHeader.substring(7).trim();
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.warn('⚠️ JWT_SECRET is not defined in environment variables. Using fallback.');
    }

    const decoded = jwt.verify(token, jwtSecret || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid token or user not found' });
    }

    req.user = { ...user.toObject(), id: user._id };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = auth;
