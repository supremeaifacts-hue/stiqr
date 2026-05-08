// backend/index.js
const express = require('express');
const cors = require('cors');
const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://www.stiqr.top',
  'https://stiqr-frontend.pages.dev'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS not allowed'), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// MongoDB connection
const { MongoClient } = require('mongodb');
let db;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db('stiqr'); // Use 'stiqr' database
  console.log('✅ MongoDB connected');
}

// ========== AUTHENTICATION ROUTES ==========

// POST /auth/signup - Create a new user
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const usersCollection = db.collection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create new user (no password hashing for now)
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
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// POST /auth/login - Authenticate user
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const usersCollection = db.collection('users');
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
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// GET /auth/status - Check auth status
app.get('/auth/status', (req, res) => {
  res.json({ authenticated: false });
});

// ========== START SERVER ==========
connectDB().then(() => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
});
