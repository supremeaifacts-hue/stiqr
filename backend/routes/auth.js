const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to check if user is authenticated via JWT token
const isAuthenticated = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      authProvider: user.authProvider 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Initiate Google OAuth
router.get('/google', (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({ 
      error: 'Google OAuth not configured',
      message: 'Please configure Google OAuth credentials in the backend .env file'
    });
  }
  
  // Store the redirect URL in session if provided
  if (req.query.redirect) {
    req.session.redirectUrl = req.query.redirect;
  }
  
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account' // Force account selection
  })(req, res, next);
});

// Google OAuth callback with detailed error logging
router.get('/google/callback',
  (req, res, next) => {
    console.log('=== Google OAuth Callback Started ===');
    console.log('Query params:', req.query);
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    
    passport.authenticate('google', { 
      failureRedirect: '/auth/failure',
      session: true 
    })(req, res, next);
  },
  (req, res) => {
    try {
      console.log('=== Google OAuth Callback Success ===');
      console.log('Authenticated user:', req.user ? req.user.email : 'No user');
      console.log('Session after auth:', req.session);
      
      // Successful authentication
      const redirectUrl = req.session.redirectUrl || process.env.FRONTEND_URL || '/';
      delete req.session.redirectUrl;
      
      console.log('Redirecting to:', redirectUrl);
      
      // Redirect to frontend with success message
      res.redirect(`${redirectUrl}?auth=success&user=${encodeURIComponent(req.user.email)}`);
    } catch (error) {
      console.error('=== Error in callback handler ===');
      console.error('Error:', error);
      console.error('Error stack:', error.stack);
      res.redirect(`${process.env.FRONTEND_URL || '/'}?auth=error&message=${encodeURIComponent(error.message)}`);
    }
  }
);

// Authentication failure
router.get('/failure', (req, res) => {
  const redirectUrl = req.session.redirectUrl || process.env.FRONTEND_URL || '/';
  delete req.session.redirectUrl;
  
  res.redirect(`${redirectUrl}?auth=failed`);
});

// Get current user (JWT-based)
router.get('/user', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    // Clear session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

// Check authentication status (JWT-based)
router.get('/status', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.json({ authenticated: false, user: null });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.json({ authenticated: false, user: null });
    }
    res.json({
      authenticated: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    res.json({ authenticated: false, user: null });
  }
});

// Debug endpoint to check environment and configuration
router.get('/debug', async (req, res) => {
  // Check JWT auth status
  let authenticated = false;
  let userEmail = null;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        authenticated = true;
        userEmail = user.email;
      }
    }
  } catch (e) {
    // Not authenticated
  }

  const debugInfo = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set (hidden)' : 'Not set',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set (hidden)' : 'Not set',
      GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
      SESSION_SECRET: process.env.SESSION_SECRET ? 'Set (hidden)' : 'Not set',
      FRONTEND_URL: process.env.FRONTEND_URL
    },
    session: {
      sessionID: req.sessionID,
      authenticated,
      user: userEmail
    },
    server: {
      time: new Date().toISOString(),
      uptime: process.uptime()
    }
  };
  
  res.json(debugInfo);
});

// Email/Password Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      displayName: displayName || email.split('@')[0],
      authProvider: 'local',
      isVerified: false
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and token
    res.status(201).json({
      success: true,
      user: user.getPublicProfile(),
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Email/Password Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user with password field included
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is using local auth
    // If authProvider is missing/undefined, treat as 'local' for backward compatibility
    const authProvider = user.authProvider || 'local';
    if (authProvider !== 'local') {
      return res.status(401).json({ 
        error: `Account uses ${authProvider} authentication. Please use ${authProvider} sign-in.` 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and token
    res.json({
      success: true,
      user: user.getPublicProfile(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user from JWT token (alternative to session-based auth)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
