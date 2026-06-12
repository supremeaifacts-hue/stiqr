const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to check if user is authenticated (supports both session and JWT)
const isAuthenticated = async (req, res, next) => {
  // Check session-based authentication first
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Check JWT token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Attach user to request object
      req.user = user;
      return next();
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
  
  // Check JWT token from query parameter (for backward compatibility)
  const token = req.query.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      // Attach user to request object
      req.user = user;
      return next();
    } catch (error) {
      console.error('JWT verification error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
  
  res.status(401).json({ error: 'Not authenticated' });
};

// Generate unique ID for assets
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get all user assets
router.get('/assets', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      stickers: user.stickers || [],
      logos: user.logos || [],
      qrCodes: user.qrCodes || []
    });
  } catch (error) {
    console.error('Error fetching user assets:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save a sticker
router.post('/assets/stickers', isAuthenticated, async (req, res) => {
  try {
    const { data, name, category } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Sticker data is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newSticker = {
      id: generateId(),
      data,
      name: name || 'Untitled Sticker',
      category: category || 'custom',
      createdAt: new Date()
    };

    user.stickers.push(newSticker);
    await user.save();

    res.json({
      success: true,
      sticker: newSticker,
      message: 'Sticker saved successfully'
    });
  } catch (error) {
    console.error('Error saving sticker:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save a logo
router.post('/assets/logos', isAuthenticated, async (req, res) => {
  try {
    const { data, name } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'Logo data is required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newLogo = {
      id: generateId(),
      data,
      name: name || 'Untitled Logo',
      createdAt: new Date()
    };

    user.logos.push(newLogo);
    await user.save();

    res.json({
      success: true,
      logo: newLogo,
      message: 'Logo saved successfully'
    });
  } catch (error) {
    console.error('Error saving logo:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save a QR code
router.post('/assets/qrcodes', isAuthenticated, async (req, res) => {
  try {
    const { data, imageData, name, qrCodeId } = req.body;
    
    console.log('=== SAVE QR CODE REQUEST RECEIVED ===');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('data (destination):', data ? data.substring(0, 100) : 'MISSING');
    console.log('imageData length:', imageData ? imageData.length : 'MISSING');
    console.log('name:', name || 'not provided');
    console.log('qrCodeId:', qrCodeId || 'not provided');
    console.log('User ID:', req.user ? req.user._id : 'NO USER ON REQUEST');
    console.log('User email:', req.user ? req.user.email : 'N/A');
    
    if (!data || !imageData) {
      console.log('❌ Missing required fields: data=' + !!data + ', imageData=' + !!imageData);
      return res.status(400).json({ error: 'QR code data and image data are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('❌ User not found in database for ID:', req.user._id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✅ User found:', user.email);
    console.log('Current QR codes count before save:', user.qrCodes ? user.qrCodes.length : 0);

    // Use provided ID or generate a new one
    const qrId = qrCodeId || generateId();
    console.log('Using QR code ID:', qrId);
    
    // Generate tracking URL
    const trackingUrl = `${req.protocol}://${req.get('host')}/track/${qrId}`;
    const scanUrl = trackingUrl; // For backward compatibility
    console.log('Tracking URL:', trackingUrl);
    
    const newQrCode = {
      id: qrId,
      data, // Store the original destination URL
      imageData, // QR code image is already encoded with the tracking URL from frontend
      name: name || 'Untitled QR Code',
      scans: 0,
      createdAt: new Date(),
      lastScanned: new Date()
    };

    user.qrCodes.push(newQrCode);
    
    // Update stats
    user.stats.qrCodesCreated = (user.stats.qrCodesCreated || 0) + 1;
    
    await user.save();
    console.log('✅ QR code saved successfully!');
    console.log('New QR codes count after save:', user.qrCodes.length);
    console.log('Last QR code ID:', user.qrCodes[user.qrCodes.length - 1].id);
    console.log('Last QR code data:', user.qrCodes[user.qrCodes.length - 1].data);

    // Return both the tracking URL and the original data
    res.json({
      success: true,
      qrCode: {
        ...newQrCode,
        trackingUrl,
        scanUrl, // For backward compatibility
        originalUrl: data
      }
    });
  } catch (error) {
    console.error('❌ Error saving QR code:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// ============================================================
// NEW ROUTE: POST /api/qrcodes
// Saves QR code to a standalone 'qrcodes' collection.
// This is the collection that the EdgeOne function queries
// when handling /track/:id redirects.
// No authentication required - accepts { id, data } directly.
// ============================================================
router.post('/qrcodes', async (req, res) => {
  try {
    const { id, data } = req.body;
    
    console.log('=== POST /api/qrcodes REQUEST RECEIVED ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('id:', id);
    console.log('data:', data ? data.substring(0, 100) : 'MISSING');
    
    if (!id || !data) {
      console.log('❌ Missing required fields: id=' + !!id + ', data=' + !!data);
      return res.status(400).json({ error: 'Both id and data are required' });
    }
    
    // Get the MongoDB native driver to access the qrcodes collection
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    const collection = db.collection('qrcodes');
    
    // Upsert: insert if not exists, update if exists
    const result = await collection.updateOne(
      { id: id },
      { 
        $set: { 
          id: id,
          data: data,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date(),
          scan_count: 0
        }
      },
      { upsert: true }
    );
    
    console.log('✅ QR code saved to qrcodes collection!');
    console.log('   Matched:', result.matchedCount);
    console.log('   Modified:', result.modifiedCount);
    console.log('   Upserted:', result.upsertedCount);
    console.log('   Upserted ID:', result.upsertedId ? result.upsertedId._id : 'N/A');
    
    res.json({
      success: true,
      message: 'QR code saved successfully',
      id: id,
      data: data
    });
    
  } catch (error) {
    console.error('❌ Error saving QR code to qrcodes collection:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// Delete a sticker
router.delete('/assets/stickers/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const initialLength = user.stickers.length;
    user.stickers = user.stickers.filter(sticker => sticker.id !== id);
    
    if (user.stickers.length === initialLength) {
      return res.status(404).json({ error: 'Sticker not found' });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Sticker deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting sticker:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a logo
router.delete('/assets/logos/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const initialLength = user.logos.length;
    user.logos = user.logos.filter(logo => logo.id !== id);
    
    if (user.logos.length === initialLength) {
      return res.status(404).json({ error: 'Logo not found' });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Logo deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting logo:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a QR code
router.delete('/assets/qrcodes/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const initialLength = user.qrCodes.length;
    user.qrCodes = user.qrCodes.filter(qrCode => qrCode.id !== id);
    
    if (user.qrCodes.length === initialLength) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    await user.save();

    res.json({
      success: true,
      message: 'QR code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting QR code:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update QR code scan count (public endpoint - no authentication required)
router.post('/assets/qrcodes/:id/scan', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user by QR code ID (we need to search all users)
    const user = await User.findOne({ 'qrCodes.id': id });
    if (!user) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    const qrCode = user.qrCodes.find(qr => qr.id === id);
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    qrCode.scans = (qrCode.scans || 0) + 1;
    qrCode.lastScanned = new Date();
    
    // Update total scans in stats
    user.stats.totalScans = (user.stats.totalScans || 0) + 1;
    
    await user.save();

    res.json({
      success: true,
      scans: qrCode.scans,
      message: 'Scan recorded successfully'
    });
  } catch (error) {
    console.error('Error recording scan:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Handle legacy QR code URLs with extra path segments
// This catches patterns like /api/assets/qrcodes/:id/*
// and redirects them to the proper tracking endpoint
// Using a parameter that can match any path
router.get('/assets/qrcodes/:id/:path', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user by QR code ID
    const user = await User.findOne({ 'qrCodes.id': id });
    if (!user) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    const qrCode = user.qrCodes.find(qr => qr.id === id);
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Redirect to the proper tracking endpoint
    res.redirect(`/track/${id}`);
  } catch (error) {
    console.error('Error handling legacy QR code URL:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get QR code data for scanning (public endpoint)
router.get('/assets/qrcodes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user by QR code ID
    const user = await User.findOne({ 'qrCodes.id': id });
    if (!user) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    const qrCode = user.qrCodes.find(qr => qr.id === id);
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    res.json({
      success: true,
      qrCode: {
        id: qrCode.id,
        data: qrCode.data,
        name: qrCode.name,
        scans: qrCode.scans || 0,
        createdAt: qrCode.createdAt,
        lastScanned: qrCode.lastScanned
      }
    });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to parse user agent and get device info
function parseUserAgent(userAgent) {
  if (!userAgent) {
    return {
      type: 'other',
      brand: 'Unknown',
      model: 'Unknown',
      os: { name: 'Unknown', version: '' },
      browser: { name: 'Unknown', version: '' }
    };
  }

  const ua = userAgent.toLowerCase();
  
  // Detect device type
  let deviceType = 'other';
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'phone';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet';
  } else if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
    deviceType = 'desktop';
  } else if (ua.includes('bot') || ua.includes('crawler') || ua.includes('spider')) {
    deviceType = 'bot';
  }

  // Detect OS
  let osName = 'Unknown';
  let osVersion = '';
  if (ua.includes('windows')) {
    osName = 'Windows';
    if (ua.includes('windows nt 10')) osVersion = '10';
    else if (ua.includes('windows nt 6.3')) osVersion = '8.1';
    else if (ua.includes('windows nt 6.2')) osVersion = '8';
    else if (ua.includes('windows nt 6.1')) osVersion = '7';
  } else if (ua.includes('mac os x') || ua.includes('macintosh')) {
    osName = 'macOS';
    const match = ua.match(/mac os x (\d+[._]\d+)/);
    if (match) osVersion = match[1].replace('_', '.');
  } else if (ua.includes('android')) {
    osName = 'Android';
    const match = ua.match(/android (\d+\.\d+)/);
    if (match) osVersion = match[1];
  } else if (ua.includes('iphone') || ua.includes('ipad')) {
    osName = 'iOS';
    const match = ua.match(/os (\d+[._]\d+)/);
    if (match) osVersion = match[1].replace('_', '.');
  } else if (ua.includes('linux')) {
    osName = 'Linux';
  }

  // Detect browser
  let browserName = 'Unknown';
  let browserVersion = '';
  if (ua.includes('chrome') && !ua.includes('chromium')) {
    browserName = 'Chrome';
    const match = ua.match(/chrome\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('firefox')) {
    browserName = 'Firefox';
    const match = ua.match(/firefox\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browserName = 'Safari';
    const match = ua.match(/version\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('edge')) {
    browserName = 'Edge';
    const match = ua.match(/edge\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  } else if (ua.includes('opera')) {
    browserName = 'Opera';
    const match = ua.match(/opera\/(\d+\.\d+)/);
    if (match) browserVersion = match[1];
  }

  // Detect device brand/model
  let brand = 'Unknown';
  let model = 'Unknown';
  
  if (ua.includes('iphone')) {
    brand = 'Apple';
    model = 'iPhone';
  } else if (ua.includes('ipad')) {
    brand = 'Apple';
    model = 'iPad';
  } else if (ua.includes('macintosh')) {
    brand = 'Apple';
    model = 'Mac';
  } else if (ua.includes('samsung')) {
    brand = 'Samsung';
    model = 'Galaxy';
  } else if (ua.includes('huawei')) {
    brand = 'Huawei';
  } else if (ua.includes('xiaomi')) {
    brand = 'Xiaomi';
  } else if (ua.includes('google')) {
    brand = 'Google';
    if (ua.includes('pixel')) model = 'Pixel';
  }

  return {
    type: deviceType,
    brand,
    model,
    os: { name: osName, version: osVersion },
    browser: { name: browserName, version: browserVersion }
  };
}

// Helper function to get location from IP (simulated for now)
function getLocationFromIp(ipAddress) {
  // In a real implementation, you would use a geolocation API like ipinfo.io
  // For now, we'll simulate some locations based on IP patterns or return default
  
  // Default location
  const defaultLocation = {
    city: 'Unknown',
    region: 'Unknown',
    country: 'Unknown',
    countryCode: 'XX'
  };
  
  // Simple simulation based on IP patterns (for demo purposes)
  if (ipAddress === '127.0.0.1' || ipAddress === '::1') {
    return {
      city: 'Localhost',
      region: 'Development',
      country: 'Local Network',
      countryCode: 'LN'
    };
  }
  
  // You would typically use an API like:
  // const response = await fetch(`https://ipinfo.io/${ipAddress}/json?token=YOUR_TOKEN`);
  // const data = await response.json();
  // return {
  //   city: data.city || 'Unknown',
  //   region: data.region || 'Unknown',
  //   country: data.country || 'Unknown',
  //   countryCode: data.country || 'XX'
  // };
  
  return defaultLocation;
}

// Redirect endpoint for QR code scanning (records scan and redirects)
router.get('/assets/qrcodes/:id/redirect', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user by QR code ID
    const user = await User.findOne({ 'qrCodes.id': id });
    if (!user) {
      return res.status(404).send('QR code not found');
    }

    const qrCode = user.qrCodes.find(qr => qr.id === id);
    if (!qrCode) {
      return res.status(404).send('QR code not found');
    }

    // Get client information
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Parse device information from user agent
    const deviceInfo = parseUserAgent(userAgent);
    
    // Get location from IP (simulated for now)
    const location = getLocationFromIp(ipAddress);
    
    // Create scan record
    const scanRecord = {
      timestamp: new Date(),
      ipAddress,
      userAgent,
      location,
      device: deviceInfo
    };
    
    // Record the scan
    qrCode.scans = (qrCode.scans || 0) + 1;
    qrCode.lastScanned = new Date();
    
    // Add to scan history (only for Pro/Ultra users or if subscription allows)
    if (user.subscription.plan !== 'free') {
      // Initialize scanHistory if it doesn't exist
      if (!qrCode.scanHistory) {
        qrCode.scanHistory = [];
      }
      qrCode.scanHistory.push(scanRecord);
    }
    
    // Update total scans in stats
    user.stats.totalScans = (user.stats.totalScans || 0) + 1;
    
    await user.save();

    // Redirect to the actual URL
    // Ensure the URL has a protocol (http:// or https://)
    let redirectUrl = qrCode.data;
    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      redirectUrl = 'https://' + redirectUrl;
    }
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error processing QR code redirect:', error);
    res.status(500).send('Server error');
  }
});

// Get scan statistics for a QR code (authenticated endpoint)
router.get('/assets/qrcodes/:id/statistics', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user by QR code ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const qrCode = user.qrCodes.find(qr => qr.id === id);
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Check if user has access to detailed statistics (Pro/Ultra tier)
    if (user.subscription.plan === 'free') {
      return res.json({
        success: true,
        qrCode: {
          id: qrCode.id,
          name: qrCode.name,
          scans: qrCode.scans || 0,
          lastScanned: qrCode.lastScanned
        },
        statistics: {
          totalScans: qrCode.scans || 0,
          message: 'Upgrade to Pro or Ultra plan to view detailed scan statistics'
        }
      });
    }

    // Get scan history
    const scanHistory = qrCode.scanHistory || [];
    
    // Calculate statistics
    const statistics = {
      totalScans: qrCode.scans || 0,
      scanHistory: scanHistory.map(scan => ({
        timestamp: scan.timestamp,
        location: scan.location,
        device: scan.device
      })),
      // Device breakdown
      deviceTypes: {},
      // OS breakdown
      operatingSystems: {},
      // Browser breakdown
      browsers: {},
      // Location breakdown
      locations: {},
      // Hourly breakdown
      hourlyScans: Array(24).fill(0)
    };

    // Calculate breakdowns
    scanHistory.forEach(scan => {
      // Device type
      const deviceType = scan.device.type || 'other';
      statistics.deviceTypes[deviceType] = (statistics.deviceTypes[deviceType] || 0) + 1;
      
      // OS
      const osName = scan.device.os?.name || 'Unknown';
      statistics.operatingSystems[osName] = (statistics.operatingSystems[osName] || 0) + 1;
      
      // Browser
      const browserName = scan.device.browser?.name || 'Unknown';
      statistics.browsers[browserName] = (statistics.browsers[browserName] || 0) + 1;
      
      // Location
      const locationKey = `${scan.location.city}, ${scan.location.country}`;
      statistics.locations[locationKey] = (statistics.locations[locationKey] || 0) + 1;
      
      // Hour
      const hour = new Date(scan.timestamp).getHours();
      statistics.hourlyScans[hour]++;
    });

    res.json({
      success: true,
      qrCode: {
        id: qrCode.id,
        name: qrCode.name,
        scans: qrCode.scans || 0,
        lastScanned: qrCode.lastScanned
      },
      statistics
    });
  } catch (error) {
    console.error('Error fetching QR code statistics:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simple tracking endpoint that redirects to the full tracking endpoint
router.get('/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user by QR code ID
    const user = await User.findOne({ 'qrCodes.id': id });
    if (!user) {
      return res.status(404).send('QR code not found');
    }

    const qrCode = user.qrCodes.find(qr => qr.id === id);
    if (!qrCode) {
      return res.status(404).send('QR code not found');
    }

    // Redirect to the full tracking endpoint which will record the scan and redirect to destination
    res.redirect(`/api/assets/qrcodes/${id}/redirect`);
  } catch (error) {
    console.error('Error in tracking endpoint:', error);
    res.status(500).send('Server error');
  }
});

// POST /api/qrcodes/:id/increment - Increment scan count
router.post('/qrcodes/:id/increment', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First try to update in the standalone qrcodes collection
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI;
    
    if (uri) {
      const client = new MongoClient(uri);
      try {
        await client.connect();
        const db = client.db('stiqr');
        const collection = db.collection('qrcodes');
        
        // Increment scan count in qrcodes collection
        await collection.updateOne(
          { id },
          { 
            $inc: { scan_count: 1 },
            $set: { lastScanned: new Date() }
          }
        );
        console.log(`✅ Incremented scan count for ${id} in qrcodes collection`);
      } catch (dbError) {
        console.error('MongoDB error incrementing scan count:', dbError);
      } finally {
        await client.close();
      }
    }
    
    // Also update in user's qrCodes array if possible
    try {
      const User = require('../models/User');
      const user = await User.findOne({ 'qrCodes.id': id });
      if (user) {
        const qrCode = user.qrCodes.find(qr => qr.id === id);
        if (qrCode) {
          qrCode.scans = (qrCode.scans || 0) + 1;
          qrCode.lastScanned = new Date();
          await user.save();
          console.log(`✅ Incremented scan count for ${id} in user collection`);
        }
      }
    } catch (userError) {
      console.error('Error updating user scan count:', userError);
    }
    
    res.json({ success: true, message: 'Scan count incremented' });
  } catch (error) {
    console.error('Error incrementing scan count:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simple stats endpoint - returns just scan count
router.get('/qrcodes/:id/stats', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find user by QR code ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const qrCode = user.qrCodes.find(qr => qr.id === id);
    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    res.json({
      success: true,
      scanCount: qrCode.scans || 0
    });
  } catch (error) {
    console.error('Error fetching QR code stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Note: Legacy QR code URLs like /api/assets/qrcodes/:id/destination
// are not supported. QR codes should be accessed via /track/:id
// which redirects to /api/assets/qrcodes/:id/redirect

// Get user subscription status
router.get('/user/subscription', isAuthenticated, async (req, res) => {
  try {
    // ADDED LOGS AS REQUESTED
    console.log('=== SUBSCRIPTION CHECK ===');
    console.log('User ID:', req.user?._id);
    console.log('User email:', req.user?.email);
    
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log('User found? No');
      return res.status(404).json({ error: 'User not found' });
    }

    // ADDED LOGS AS REQUESTED
    console.log('Subscription status from DB:', user.subscriptionStatus);
    console.log('Plan type from DB:', user.planType);
    console.log('User subscription object:', user.subscription);
    console.log('User found? Yes');

    // Determine subscription status based on plan and isActive
    const subscriptionStatus = user.subscription.isActive && 
                              (user.subscription.plan === 'pro' || user.subscription.plan === 'ultra') 
                              ? 'active' : 'inactive';
    
    // Determine subscription end date
    let subscriptionEndDate = null;
    if (user.subscription.stripeCurrentPeriodEnd) {
      subscriptionEndDate = user.subscription.stripeCurrentPeriodEnd;
    } else if (user.subscription.expiresAt) {
      subscriptionEndDate = user.subscription.expiresAt;
    } else if (user.subscription.trialEndsAt) {
      subscriptionEndDate = user.subscription.trialEndsAt;
    }

    res.json({
      subscriptionStatus,
      planType: user.subscription.plan,
      subscriptionEndDate,
      isActive: user.subscription.isActive,
      stripeCustomerId: user.subscription.stripeCustomerId,
      stripeSubscriptionId: user.subscription.stripeSubscriptionId,
      trialEndsAt: user.subscription.trialEndsAt,
      subscribedAt: user.subscription.subscribedAt
    });
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================================
// Event Pages API
// ============================================================

// Save/Update an event page
router.post('/event-pages', async (req, res) => {
  try {
    const { id, title, summary, about, image, dateFrom, dateTo, services, address, contact, pageColor } = req.body;

    if (!id || !title) {
      return res.status(400).json({ error: 'Event page ID and title are required' });
    }

    // Find user by JWT token
    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {
        // Token invalid, but we still save the event page
      }
    }

    // Store event page data in a separate collection or embedded in user
    // For now, we'll store it in a simple way using the User model's qrCodes or a separate mechanism
    // Since we don't have an EventPage model, we'll store it in a global eventPages object
    // In production, you'd want a proper MongoDB collection
    
    const eventPageData = {
      id,
      title,
      summary: summary || '',
      about: about || '',
      image: image || null,
      dateFrom: dateFrom || '',
      dateTo: dateTo || '',
      services: services || {},
      address: address || {},
      contact: contact || {},
      pageColor: pageColor || '#e5e9ec',
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in MongoDB event_pages collection
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI;
    if (uri) {
      const client = new MongoClient(uri);
      try {
        await client.connect();
        const db = client.db('stiqr');
        const collection = db.collection('event_pages');
        
        // Upsert the event page
        await collection.updateOne(
          { id },
          { $set: eventPageData },
          { upsert: true }
        );
        
        console.log(`✅ Event page saved to MongoDB: ${id}`);
      } catch (dbError) {
        console.error('MongoDB error saving event page:', dbError);
        // Continue even if DB fails - we'll return success
      } finally {
        await client.close();
      }
    }

    res.json({ success: true, id, message: 'Event page saved successfully' });
  } catch (error) {
    console.error('Error saving event page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get an event page by ID (public endpoint)
router.get('/event-pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db('stiqr');
      const collection = db.collection('event_pages');
      
      const eventPage = await collection.findOne({ id });
      
      if (!eventPage) {
        return res.status(404).json({ error: 'Event page not found' });
      }
      
      res.json(eventPage);
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error fetching event page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve event landing page HTML
router.get('/event/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI;
    
    let eventPage = null;
    
    if (uri) {
      const client = new MongoClient(uri);
      try {
        await client.connect();
        const db = client.db('stiqr');
        const collection = db.collection('event_pages');
        eventPage = await collection.findOne({ id });
      } catch (dbError) {
        console.error('MongoDB error fetching event page:', dbError);
      } finally {
        await client.close();
      }
    }
    
    if (!eventPage) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Event Not Found</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #0a0a0a; color: #fff; }
          .container { text-align: center; padding: 40px; }
          h1 { color: #FF00FF; }
          p { color: #a0a0a0; }
        </style>
        </head>
        <body>
          <div class="container">
            <h1>Event Not Found</h1>
            <p>The event you're looking for doesn't exist or has been removed.</p>
          </div>
        </body>
        </html>
      `);
    }

    const { title, summary, about, image, dateFrom, dateTo, services, address, contact, pageColor } = eventPage;
    
    // Format dates
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      try {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch { return dateStr; }
    };
    
    const dateFromFormatted = formatDate(dateFrom);
    const dateToFormatted = formatDate(dateTo);
    
    // Build address string
    const addressParts = [];
    if (address?.street) addressParts.push(address.street);
    if (address?.city) addressParts.push(address.city);
    if (address?.state) addressParts.push(address.state);
    if (address?.zip) addressParts.push(address.zip);
    if (address?.country) addressParts.push(address.country);
    const addressStr = addressParts.join(', ');
    
    // Build services HTML
    const serviceEmojis = {
      wifi: '📶', bathroom: '🚻', handicapped: '♿', babies: '👶',
      dogs: '🐕', parking: '🅿️', food: '🍽️'
    };
    const serviceLabels = {
      wifi: 'Wi-Fi', bathroom: 'Bathroom', handicapped: 'Handicapped Facilities',
      babies: 'Babies Allowed', dogs: 'Dogs Allowed', parking: 'Parking', food: 'Food'
    };
    
    let servicesHtml = '';
    if (services) {
      const activeServices = Object.entries(serviceEmojis)
        .filter(([key]) => services[key])
        .map(([key, emoji]) => `<span title="${serviceLabels[key]}" style="font-size:24px;filter:grayscale(100%)">${emoji}</span>`);
      if (activeServices.length > 0) {
        servicesHtml = `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${activeServices.join('')}</div>`;
      }
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>${title ? title + ' - Event' : 'Event'}</title>
        <meta name="description" content="${summary || 'Event page'}">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: ${pageColor || '#e5e9ec'};
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .container {
            max-width: 500px;
            width: 100%;
            padding: 40px 24px;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .event-image {
            width: 100%;
            max-height: 200px;
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.05);
          }
          .event-image img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            max-height: 200px;
          }
          .event-title {
            font-size: 24px;
            font-weight: 700;
            color: #000;
            text-align: center;
            line-height: 1.2;
          }
          .event-summary {
            font-size: 14px;
            color: #333;
            text-align: center;
            line-height: 1.4;
          }
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #000;
            margin-top: 8px;
          }
          .section-divider {
            height: 1px;
            background: rgba(0,0,0,0.1);
            margin: 4px 0;
          }
          .about-text {
            font-size: 13px;
            color: #333;
            line-height: 1.5;
          }
          .date-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #000;
            font-weight: 600;
          }
          .address-row {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-size: 13px;
            color: #000;
          }
          .contact-item {
            font-size: 13px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .contact-name {
            font-size: 13px;
            color: #000;
            font-weight: 600;
          }
          .emoji-icon {
            filter: grayscale(100%);
          }
        </style>
      </head>
      <body>
        <div class="container">
          ${image ? `<div class="event-image"><img src="${image}" alt="${title || 'Event'}"></div>` : ''}
          
          ${title ? `<h1 class="event-title">${title}</h1>` : ''}
          
          ${summary ? `<p class="event-summary">${summary}</p>` : ''}
          
          ${about ? `
            <div class="section-title">About</div>
            <div class="section-divider"></div>
            <p class="about-text">${about}</p>
          ` : ''}
          
          ${(dateFrom || dateTo) ? `
            <div class="section-title">Details</div>
            <div class="section-divider"></div>
            <div class="date-row">
              <span class="emoji-icon">📅</span>
              <span>${dateFromFormatted}${dateFrom && dateTo ? ' - ' : ''}${dateToFormatted}</span>
            </div>
            ${servicesHtml}
          ` : ''}
          
          ${addressStr ? `
            <div class="section-title">Address</div>
            <div class="section-divider"></div>
            <div class="address-row">
              <span class="emoji-icon">📍</span>
              <span>${addressStr}</span>
            </div>
          ` : ''}
          
          ${(contact?.name || contact?.phone || contact?.email || contact?.website) ? `
            <div class="section-title">Contacts</div>
            <div class="section-divider"></div>
            ${contact?.name ? `<div class="contact-name">${contact.name}</div>` : ''}
            ${contact?.phone ? `<div class="contact-item"><span class="emoji-icon">📞</span> ${contact.phone}</div>` : ''}
            ${contact?.email ? `<div class="contact-item"><span class="emoji-icon">✉️</span> ${contact.email}</div>` : ''}
            ${contact?.website ? `<div class="contact-item"><span class="emoji-icon">🌐</span> ${contact.website}</div>` : ''}
          ` : ''}
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error serving event page:', error);
    res.status(500).send('Server error');
  }
});

// Save/Update a social media page
router.post('/social-pages', async (req, res) => {
  try {
    const { id, buttons, title, pageColor, headline, design } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    // Find user by JWT token
    const authHeader = req.headers.authorization;
    let userId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {
        // Token invalid, but we still save the social page
      }
    }

    const socialPageData = {
      id,
      buttons: buttons || [],
      title: title || 'My Social Links',
      headline: headline || '',
      pageColor: pageColor || '#e5e9ec',
      design: design || {},
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in MongoDB social_pages collection
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI;
    if (uri) {
      const client = new MongoClient(uri);
      try {
        await client.connect();
        const db = client.db('stiqr');
        const collection = db.collection('social_pages');
        
        // Upsert the social page
        await collection.updateOne(
          { id },
          { $set: socialPageData },
          { upsert: true }
        );
        
        console.log(`✅ Social page saved to MongoDB: ${id}`);
      } catch (dbError) {
        console.error('MongoDB error saving social page:', dbError);
      } finally {
        await client.close();
      }
    }

    res.json({ success: true, id, message: 'Social page saved successfully' });
  } catch (error) {
    console.error('Error saving social page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a social page by ID (public endpoint)
router.get('/social-pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db('stiqr');
      const collection = db.collection('social_pages');
      
      const socialPage = await collection.findOne({ id });
      
      if (!socialPage) {
        return res.status(404).json({ error: 'Social page not found' });
      }
      
      res.json(socialPage);
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error fetching social page:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

