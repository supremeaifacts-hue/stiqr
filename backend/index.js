const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'https://www.stiqr.top', 'https://stiqr-frontend.pages.dev'],
  credentials: true
}));
app.use(express.json());

let db;
let usersCollection;

// Connect to MongoDB
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
  console.log('✅ MongoDB connected to stiqr database');
}

// Routes
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const newUser = { email, password, name: name || email.split('@')[0], createdAt: new Date() };
    await usersCollection.insertOne(newUser);
    res.json({ success: true, message: 'User created', email });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await usersCollection.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ success: true, user: { email: user.email, name: user.name } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/auth/status', (req, res) => {
  res.json({ authenticated: false });
});

// Mock endpoints for frontend
app.get('/api/user/subscription', (req, res) => {
  res.json({ subscriptionStatus: 'free', planType: 'free' });
});

app.get('/api/assets', (req, res) => {
  res.json({ stickers: [], logos: [] });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
