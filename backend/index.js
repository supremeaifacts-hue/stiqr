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

// GET /api/assets - Get all user assets (stickers, logos)
app.get('/api/assets', async (req, res) => {
  try {
    const stickersCollection = db.collection('stickers');
    const logosCollection = db.collection('logos');
    
    const stickers = await stickersCollection.find({}).toArray();
    const logos = await logosCollection.find({}).toArray();
    
    console.log(`GET /api/assets: returning ${stickers.length} stickers, ${logos.length} logos`);
    
    res.json({ stickers, logos });
  } catch (error) {
    console.error('GET /api/assets error:', error);
    res.json({ stickers: [], logos: [] });
  }
});

// POST /api/assets/stickers - Save a sticker
app.post('/api/assets/stickers', async (req, res) => {
  try {
    const { data, name, category } = req.body;
    const stickersCollection = db.collection('stickers');
    
    const sticker = {
      data,
      name: name || 'Untitled Sticker',
      category: category || 'custom',
      userId: req.headers['x-user-email'] || 'anonymous',
      createdAt: new Date()
    };
    
    const result = await stickersCollection.insertOne(sticker);
    
    console.log(`Sticker saved: ${sticker.name} (ID: ${result.insertedId})`);
    
    res.json({ 
      success: true, 
      sticker: { ...sticker, _id: result.insertedId } 
    });
  } catch (error) {
    console.error('Save sticker error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/assets/stickers/:id - Delete a sticker
app.delete('/api/assets/stickers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = require('mongodb');
    const stickersCollection = db.collection('stickers');
    
    const result = await stickersCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Sticker not found' });
    }
    
    console.log(`Sticker deleted: ${id}`);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Delete sticker error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/assets/logos - Save a logo
app.post('/api/assets/logos', async (req, res) => {
  try {
    const { data, name } = req.body;
    const logosCollection = db.collection('logos');
    
    const logo = {
      data,
      name: name || 'Untitled Logo',
      userId: req.headers['x-user-email'] || 'anonymous',
      createdAt: new Date()
    };
    
    const result = await logosCollection.insertOne(logo);
    
    console.log(`Logo saved: ${logo.name} (ID: ${result.insertedId})`);
    
    res.json({ 
      success: true, 
      logo: { ...logo, _id: result.insertedId } 
    });
  } catch (error) {
    console.error('Save logo error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/assets/logos/:id - Delete a logo
app.delete('/api/assets/logos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = require('mongodb');
    const logosCollection = db.collection('logos');
    
    const result = await logosCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Logo not found' });
    }
    
    console.log(`Logo deleted: ${id}`);
    res.json({ success: true, id });
  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({ error: error.message });
  }
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
    
    // Determine the destination URL - handle both 'destination' and 'data' field names
    const destination = qrCode.destination || qrCode.data;
    console.log(`Redirecting to: ${destination}`);
    return res.redirect(destination);
  } catch (error) {
    console.error('Tracking error:', error);
    return res.redirect('https://www.youtube.com');
  }
});

// GET /api/qrcodes/:id - Get QR code destination
app.get('/api/qrcodes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const qrCodesCollection = db.collection('qrcodes');
    const qrCode = await qrCodesCollection.findOne({ id });
    if (!qrCode) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ destination: qrCode.destination || qrCode.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/qrcodes/:id/increment - Increment scan count
app.post('/api/qrcodes/:id/increment', async (req, res) => {
  try {
    const { id } = req.params;
    const qrCodesCollection = db.collection('qrcodes');
    await qrCodesCollection.updateOne(
      { id },
      { $inc: { scan_count: 1 } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/scan/log - Log scan analytics
app.post('/api/scan/log', async (req, res) => {
  try {
    const scanData = req.body;
    const scansCollection = db.collection('scans');
    
    await scansCollection.insertOne({
      ...scanData,
      processedAt: new Date()
    });
    
    console.log(`📊 Scan logged: ${scanData.qrCodeId} from ${scanData.country || 'unknown'}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/:qrCodeId - Get analytics for a specific QR code
app.get('/api/analytics/:qrCodeId', async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    const scansCollection = db.collection('scans');
    
    const scans = await scansCollection.find({ qrCodeId }).toArray();
    
    // Calculate summary statistics
    const summary = {
      totalScans: scans.length,
      uniqueCountries: [...new Set(scans.map(s => s.country).filter(Boolean))],
      devices: {
        mobile: scans.filter(s => s.deviceType === 'mobile').length,
        desktop: scans.filter(s => s.deviceType === 'desktop').length,
        tablet: scans.filter(s => s.deviceType === 'tablet').length
      },
      browsers: {},
      os: {},
      scansByHour: {},
      recentScans: scans.slice(-10).reverse()
    };
    
    // Count browsers and OS
    scans.forEach(scan => {
      if (scan.browser) summary.browsers[scan.browser] = (summary.browsers[scan.browser] || 0) + 1;
      if (scan.os) summary.os[scan.os] = (summary.os[scan.os] || 0) + 1;
    });
    
    res.json({ summary, scans });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/:qrCodeId/timeline - Get scans over time
app.get('/api/analytics/:qrCodeId/timeline', async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    const scansCollection = db.collection('scans');
    
    const scans = await scansCollection.find({ qrCodeId }).toArray();
    
    // Group scans by date
    const timeline = {};
    scans.forEach(scan => {
      const date = new Date(scan.timestamp).toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });
    
    res.json({ timeline });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/:qrCodeId/summary - Get analytics summary for a QR code
app.get('/api/analytics/:qrCodeId/summary', async (req, res) => {
  try {
    const { qrCodeId } = req.params;
    const scansCollection = db.collection('scans');
    
    const scans = await scansCollection.find({ qrCodeId }).toArray();
    
    const summary = {
      totalScans: scans.length,
      byDevice: {},
      byCountry: {},
      byDate: {},
      recentScans: scans.slice(-20).reverse()
    };
    
    scans.forEach(scan => {
      const device = scan.deviceType || 'unknown';
      summary.byDevice[device] = (summary.byDevice[device] || 0) + 1;
      
      const country = scan.country || 'unknown';
      summary.byCountry[country] = (summary.byCountry[country] || 0) + 1;
      
      const date = new Date(scan.timestamp).toISOString().split('T')[0];
      summary.byDate[date] = (summary.byDate[date] || 0) + 1;
    });
    
    res.json(summary);
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ error: error.message });
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
    // Accept both naming conventions (frontend sends 'data'/'imageData', backend can use 'qrData'/'qrImageData')
    const { qrCodeId, qrData, qrImageData, design, data, imageData, name } = req.body;
    const finalId = qrCodeId || req.body.id;
    const finalData = qrData || data || '';
    const finalImageData = qrImageData || imageData || '';
    const finalName = name || finalId || 'Untitled QR Code';
    
    console.log(`Saving QR code to user assets: ${finalId}`);
    console.log(`Image data length: ${finalImageData?.length || 0}`);
    console.log(`Image data starts with: ${finalImageData?.substring(0, 50)}`);
    console.log(`Destination data: ${finalData?.substring(0, 50)}`);
    
    const qrCodesCollection = db.collection('qrcodes');
    
    await qrCodesCollection.updateOne(
      { id: finalId },
      { 
        $set: { 
          id: finalId,
          name: finalName,
          destination: finalData,
          qrImageData: finalImageData,
          design: design,
          userId: req.headers['x-user-email'] || 'anonymous',
          createdAt: new Date(),
          scan_count: 0 
        } 
      },
      { upsert: true }
    );
    
    res.json({ success: true, id: finalId });
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
    
    // Log what's being returned
    console.log(`Returning ${qrCodes.length} QR codes`);
    if (qrCodes.length > 0) {
      console.log(`First QR code has image data: ${!!qrCodes[0].qrImageData}`);
      console.log(`First QR code image data length: ${qrCodes[0].qrImageData?.length || 0}`);
    }
    
    res.json({ qrCodes });
  } catch (error) {
    console.error('Get QR codes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/assets/qrcodes/:id - Delete a QR code
app.delete('/api/assets/qrcodes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting QR code: ${id}`);
    
    const qrCodesCollection = db.collection('qrcodes');
    
    const result = await qrCodesCollection.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /qrcodes/:id - Delete a QR code from standalone endpoint
app.delete('/qrcodes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Deleting QR code from standalone: ${id}`);
    
    const qrCodesCollection = db.collection('qrcodes');
    
    const result = await qrCodesCollection.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'QR code not found' });
    }
    
    res.json({ success: true, id });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
