const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Path to your User model

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, 'fwmsecret'); // Replace with your secret key
    req.user = await User.findById(decoded.userId); // Fetch the user
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid user' });
    }
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
