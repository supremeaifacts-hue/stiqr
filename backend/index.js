// backend/index.js
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://www.stiqr.top',
  'https://stiqr-frontend.pages.dev'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true
}));

app.use(express.json());

// MongoDB connection
let db;
let usersCollection;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    return;
  }
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db('stiqr');
  usersCollection = db.collection('users');
  console.log('✅ MongoDB connected');
}

// ========== AUTH ROUTES ==========

// POST /auth/signup
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    console.log('Signup attempt:', email);
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Check if user exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user
    const newUser = {
      email,
      password, // TODO: hash this in production
      name: name || email.split('@')[0],
      createdAt: new Date(),
      subscriptionStatus: 'free'
    };
    
    await usersCollection.insertOne(newUser);
    
    res.json({ success: true, message: 'User created successfully', email });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// POST /auth/login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await usersCollection.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscriptionStatus
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// GET /auth/status
app.get('/auth/status', (req, res) => {
  res.json({ authenticated: false });
});

// Start server
connectDB().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
