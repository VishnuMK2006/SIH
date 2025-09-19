const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Session-based authentication middleware
const requireSession = (req, res, next) => {
  if (!req.session.isAuthenticated || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Session required. Please login again.'
    });
  }
  next();
};

// JWT-based authentication middleware
const requireJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt-secret-key-change-in-production');
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    req.user = user;
    req.userId = user._id;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    console.error('JWT middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Flexible auth middleware (checks both session and JWT)
const requireAuth = async (req, res, next) => {
  // Check session first
  if (req.session.isAuthenticated && req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
        return next();
      }
    } catch (error) {
      console.error('Session auth error:', error);
    }
  }

  // If session fails, try JWT
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return requireJWT(req, res, next);
  }

  return res.status(401).json({
    success: false,
    message: 'Authentication required. Please login.'
  });
};

// Rate limiting middleware for login attempts
const loginRateLimit = (req, res, next) => {
  // Simple in-memory rate limiting (in production, use Redis or similar)
  if (!global.loginAttempts) {
    global.loginAttempts = new Map();
  }

  const ip = req.ip || req.connection.remoteAddress;
  const attempts = global.loginAttempts.get(ip) || { count: 0, resetTime: Date.now() + 15 * 60 * 1000 };

  if (Date.now() > attempts.resetTime) {
    attempts.count = 0;
    attempts.resetTime = Date.now() + 15 * 60 * 1000; // Reset every 15 minutes
  }

  if (attempts.count >= 10) { // Max 10 attempts per 15 minutes
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.'
    });
  }

  attempts.count++;
  global.loginAttempts.set(ip, attempts);
  next();
};

// Admin role check middleware
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

module.exports = {
  requireSession,
  requireJWT,
  requireAuth,
  loginRateLimit,
  requireAdmin
};