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

// GET /track/:id - Redirect to the original destination URL
app.get('/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Tracking request for QR code: ${id}`);
    
    // Look up the QR code in your database
    const qrCodesCollection = db.collection('qrcodes');
    const qrCode = await qrCodesCollection.findOne({ id });
    
    if (!qrCode) {
      console.log(`QR code not found: ${id}`);
      // For testing, redirect to a default URL if not found
      return res.redirect('https://www.youtube.com');
    }
    
    // Increment scan count
    await qrCodesCollection.updateOne(
      { id },
      { $inc: { scan_count: 1 } }
    );
    
    console.log(`Redirecting to: ${qrCode.destination}`);
    return res.redirect(qrCode.destination);
  } catch (error) {
    console.error('Tracking error:', error);
    return res.redirect('https://www.youtube.com');
  }
});

// POST /api/qrcodes - Save a new QR code
app.post('/api/qrcodes', async (req, res) => {
  try {
    const { id, destination, qrCodeData } = req.body;
    console.log(`Saving QR code: ${id} -> ${destination}`);
    
    const qrCodesCollection = db.collection('qrcodes');
    
    await qrCodesCollection.updateOne(
      { id },
      { 
        $set: { 
          id, 
          destination, 
          qrCodeData,
          createdAt: new Date(),
          scan_count: 0 
        } 
      },
      { upsert: true }
    );
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Save QR code error:', error);
    res.status(500).json({ error: 'Failed to save QR code' });
  }
});

// POST /api/assets/qrcodes - Save QR code to user's assets
app.post('/api/assets/qrcodes', async (req, res) => {
  try {
    const { qrCodeId, qrData, qrImageData, design } = req.body;
    console.log(`Saving QR code to user assets: ${qrCodeId}`);
    
    const qrCodesCollection = db.collection('qrcodes');
    
    await qrCodesCollection.updateOne(
      { id: qrCodeId },
      { 
        $set: { 
          id: qrCodeId,
          destination: qrData,
          qrImageData: qrImageData,
          design: design,
          userId: req.headers['x-user-email'] || 'anonymous',
          createdAt: new Date(),
          scan_count: 0 
        } 
      },
      { upsert: true }
    );
    
    res.json({ success: true, id: qrCodeId });
  } catch (error) {
    console.error('Save to assets error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/assets/qrcodes - Get user's QR codes
app.get('/api/assets/qrcodes', async (req, res) => {
  try {
    const qrCodesCollection = db.collection('qrcodes');
    const qrCodes = await qrCodesCollection.find({}).toArray();
    res.json({ qrCodes });
  } catch (error) {
    console.error('Get QR codes error:', error);
    res.status(500).json({ error: error.message });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
