const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://www.stiqr.top', 'https://stiqr-frontend.pages.dev'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from the frontend/public directory (for logos, etc.)
app.use('/logos', express.static(path.join(__dirname, '..', 'frontend', 'public', 'logos')));

// Session and Passport initialization (required for Google OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
let db;

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    return;
  }
  await mongoose.connect(uri);
  db = mongoose.connection.db;
  console.log('✅ Connected to MongoDB database: stiqr');
  return db;
}

// Make db available to routes
app.use((req, res, next) => {
  req.db = db;
  req.app.locals.db = db;
  next();
});

// ============================================================
// Tracking endpoint for QR code scans (before API routes)
// This must be at /track/:id because QR codes encode this URL
// ============================================================
app.get('/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Tracking QR code scan: ${id}`);

    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    if (!db) {
      return res.status(500).send('Database configuration error');
    }
    
    // Parse user agent for device info (used in both code paths)
    const ua = (req.headers['user-agent'] || '').toLowerCase();
    let deviceType = 'other';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) deviceType = 'phone';
    else if (ua.includes('tablet') || ua.includes('ipad')) deviceType = 'tablet';
    else if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) deviceType = 'desktop';
    
    let osName = 'Unknown';
    if (ua.includes('windows')) osName = 'Windows';
    else if (ua.includes('mac os x') || ua.includes('macintosh')) osName = 'macOS';
    else if (ua.includes('android')) osName = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) osName = 'iOS';
    else if (ua.includes('linux')) osName = 'Linux';
    
    let browserName = 'Unknown';
    if (ua.includes('chrome') && !ua.includes('chromium')) browserName = 'Chrome';
    else if (ua.includes('firefox')) browserName = 'Firefox';
    else if (ua.includes('safari') && !ua.includes('chrome')) browserName = 'Safari';
    else if (ua.includes('edge')) browserName = 'Edge';
    else if (ua.includes('opera')) browserName = 'Opera';

    // Helper function to get location from IP address using free ip-api.com
    const getLocationFromIp = async (ipAddress) => {
      try {
        // Skip lookup for private/local IPs
        if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === '::1' || ipAddress === 'localhost' || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.') || ipAddress.startsWith('172.')) {
          return { city: 'Unknown', region: 'Unknown', country: 'Unknown', countryCode: 'XX' };
        }
        
        const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=city,region,country,countryCode,query`);
        if (response.ok) {
          const data = await response.json();
          return {
            city: data.city || 'Unknown',
            region: data.region || 'Unknown',
            country: data.country || 'Unknown',
            countryCode: data.countryCode || 'XX'
          };
        }
      } catch (geoErr) {
        console.error('Error looking up location:', geoErr.message);
      }
      return { city: 'Unknown', region: 'Unknown', country: 'Unknown', countryCode: 'XX' };
    };
    
    // Helper function to save scan to the scans collection
    const saveScanToCollection = async () => {
      try {
        // Get the real IP address from various headers
        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                          req.headers['cf-connecting-ip'] || 
                          req.headers['x-real-ip'] || 
                          req.ip || 
                          req.connection?.remoteAddress || 
                          'Unknown';
        
        // Look up location from IP
        const location = await getLocationFromIp(ipAddress);
        
        const scansCollection = db.collection('scans');
        await scansCollection.insertOne({
          qrCodeId: id,
          timestamp: new Date(),
          deviceType: deviceType,
          os: osName,
          browser: browserName,
          city: location.city,
          country: location.country,
          countryCode: location.countryCode,
          region: location.region,
          userAgent: req.headers['user-agent'],
          ipAddress: ipAddress
        });
        console.log(`✅ Scan saved to scans collection for QR: ${id} from ${location.city}, ${location.country}`);
      } catch (scanErr) {
        console.error('Error saving to scans collection:', scanErr);
      }
    };
    
    // Find the QR code in the qrcodes collection
    const qrcodesCollection = db.collection('qrcodes');
    const qrCode = await qrcodesCollection.findOne({ id });
    
    if (!qrCode) {
      // Also try to find in user's qrCodes array
      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ 'qrCodes.id': id });
      if (!user) {
        return res.status(404).send('QR code not found');
      }
      
      const userQrCode = user.qrCodes.find(qr => qr.id === id);
      if (!userQrCode) {
        return res.status(404).send('QR code not found');
      }
      
      // Record scan in user's qrCodes array
      userQrCode.scans = (userQrCode.scans || 0) + 1;
      userQrCode.lastScanned = new Date();
      
      // Add scan history with parsed device info
      if (!userQrCode.scanHistory) {
        userQrCode.scanHistory = [];
      }
      
      // Get location for scan history
      const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                        req.headers['cf-connecting-ip'] || 
                        req.headers['x-real-ip'] || 
                        req.ip || 
                        req.connection?.remoteAddress || 
                        'Unknown';
      const location = await getLocationFromIp(ipAddress);
      
      userQrCode.scanHistory.push({
        timestamp: new Date(),
        ipAddress: ipAddress,
        userAgent: req.headers['user-agent'],
        location: { city: location.city, region: location.region, country: location.country, countryCode: location.countryCode },
        device: { type: deviceType, brand: 'Unknown', model: 'Unknown', os: { name: osName, version: '' }, browser: { name: browserName, version: '' } }
      });
      
      // Update total scans
      user.stats = user.stats || {};
      user.stats.totalScans = (user.stats.totalScans || 0) + 1;
      
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { qrCodes: user.qrCodes, stats: user.stats } }
      );
      
      // Save to the scans collection for analytics
      await saveScanToCollection();
      
      // Redirect to the destination URL
      let redirectUrl = userQrCode.data;
      if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
        redirectUrl = 'https://' + redirectUrl;
      }
      return res.redirect(redirectUrl);
    }
    
    // QR code found in qrcodes collection
    // Record scan
    qrCode.scans = (qrCode.scans || 0) + 1;
    qrCode.lastScanned = new Date();
    
    // Add scan history with parsed device info
    if (!qrCode.scanHistory) {
      qrCode.scanHistory = [];
    }
    
    // Get location for scan history
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                      req.headers['cf-connecting-ip'] || 
                      req.headers['x-real-ip'] || 
                      req.ip || 
                      req.connection?.remoteAddress || 
                      'Unknown';
    const location = await getLocationFromIp(ipAddress);
    
    qrCode.scanHistory.push({
      timestamp: new Date(),
      ipAddress: ipAddress,
      userAgent: req.headers['user-agent'],
      location: { city: location.city, region: location.region, country: location.country, countryCode: location.countryCode },
      device: { type: deviceType, brand: 'Unknown', model: 'Unknown', os: { name: osName, version: '' }, browser: { name: browserName, version: '' } }
    });
    
    await qrcodesCollection.updateOne(
      { id },
      { $set: { scans: qrCode.scans, lastScanned: qrCode.lastScanned, scanHistory: qrCode.scanHistory } }
    );
    
    // Save to the scans collection for analytics
    await saveScanToCollection();
    
    // Redirect to the destination URL
    let redirectUrl = qrCode.data;
    
    // IMPORTANT: Prevent redirect loops - if the stored data is a tracking URL
    // pointing back to this server, try to find the actual destination from
    // the user's qrCodes array instead
    const host = req.get('host');
    if (redirectUrl && (redirectUrl.includes(`/track/${id}`) || redirectUrl.includes(`/api/assets/qrcodes/${id}`))) {
      console.log(`⚠️ Detected redirect loop for ${id}, trying to find actual destination URL`);
      
      // Try to find in user's qrCodes array for the actual destination
      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ 'qrCodes.id': id });
      if (user) {
        const userQrCode = user.qrCodes.find(qr => qr.id === id);
        if (userQrCode && userQrCode.data && 
            !userQrCode.data.includes(`/track/${id}`) && 
            !userQrCode.data.includes(`/api/assets/qrcodes/${id}`)) {
          redirectUrl = userQrCode.data;
          console.log(`✅ Found actual destination URL from user's qrCodes: ${redirectUrl.substring(0, 100)}`);
        }
      }
      
      // If still a loop, check if this is a social/event page type
      if (redirectUrl.includes(`/track/${id}`) || redirectUrl.includes(`/api/assets/qrcodes/${id}`)) {
        // Check social_pages collection
        const socialPagesCollection = db.collection('social_pages');
        const socialPage = await socialPagesCollection.findOne({ id });
        if (socialPage) {
          const socialUrl = `${req.protocol}://${host}/social/${id}`;
          console.log(`✅ Redirecting to social page: ${socialUrl}`);
          return res.redirect(socialUrl);
        }
        
        // Check event_pages collection
        const eventPagesCollection = db.collection('event_pages');
        const eventPage = await eventPagesCollection.findOne({ id });
        if (eventPage) {
          const eventUrl = `${req.protocol}://${host}/event/${id}`;
          console.log(`✅ Redirecting to event page: ${eventUrl}`);
          return res.redirect(eventUrl);
        }
      }
    }
    
    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      redirectUrl = 'https://' + redirectUrl;
    }
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in tracking endpoint:', error);
    res.status(500).send('Server error');
  }
});

// ============================================================
// POST /qrcodes - Save QR code data to standalone collection
// This handles saves from EditorPage.js which posts to /qrcodes
// (without /api prefix)
// ============================================================
app.post('/qrcodes', async (req, res) => {
  try {
    const { id, data } = req.body;
    
    console.log('=== POST /qrcodes REQUEST RECEIVED ===');
    console.log('id:', id);
    console.log('data:', data ? data.substring(0, 100) : 'MISSING');
    
    if (!id || !data) {
      return res.status(400).json({ error: 'Both id and data are required' });
    }
    
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    
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
    
    res.json({
      success: true,
      message: 'QR code saved successfully',
      id: id,
      data: data
    });
  } catch (error) {
    console.error('Error saving QR code to qrcodes collection:', error);
    res.status(500).json({ error: 'Server error', message: error.message });
  }
});

// ============================================================
// Serve social media landing page HTML (before API routes)
// ============================================================
app.get('/social/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching social page: ${id}`);

    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    if (!db) {
      return res.status(500).send('Database configuration error');
    }

    const collection = db.collection('social_pages');
    const socialPage = await collection.findOne({ id });

    if (!socialPage) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Social Page Not Found</title>
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
            <h1>Social Page Not Found</h1>
            <p>The social media page you're looking for doesn't exist or has been removed.</p>
          </div>
        </body>
        </html>
      `);
    }

      const buttons = socialPage.buttons || [];
      const pageColor = socialPage.pageColor || '#e5e9ec';
      const headline = socialPage.headline || socialPage.title || 'Follow me';
      const design = socialPage.design || {};
      const fontFamily = design.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

      // Helper to escape HTML
      const esc = (str) => {
        if (!str) return '';
        return String(str)
          .replace(/&/g, '&')
          .replace(/</g, '<')
          .replace(/>/g, '>')
          .replace(/"/g, '"')
          .replace(/'/g, '&#39;');
      };

      // Platform logo URL mapping (using actual logo images from /logos/ directory)
      const getLogoUrl = (platform) => {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const logos = {
          'facebook': `${baseUrl}/logos/facebook.png`,
          'instagram': `${baseUrl}/logos/instagram.png`,
          'youtube': `${baseUrl}/logos/youtube.png`,
          'tiktok': `${baseUrl}/logos/tiktok.png`,
          'x': `${baseUrl}/logos/x.png`,
          'twitter': `${baseUrl}/logos/x.png`,
          'linkedin': `${baseUrl}/logos/linkedin.png`,
          'whatsapp': `${baseUrl}/logos/whatsapp.png`,
          'telegram': `${baseUrl}/logos/telegram.png`,
          'messenger': `${baseUrl}/logos/messenger.png`,
          'snapchat': null,
          'pinterest': `${baseUrl}/logos/pinterest.png`,
          'reddit': `${baseUrl}/logos/reddit.png`,
          'github': `${baseUrl}/logos/github.png`,
          'spotify': `${baseUrl}/logos/spotify.png`,
          'venmo': `${baseUrl}/logos/venmo.png`,
          'wechat': `${baseUrl}/logos/wechat.png`,
          'paypal': `${baseUrl}/logos/paypal.png`,
          'bitcoin': `${baseUrl}/logos/bitcoin.png`,
          'link': `${baseUrl}/logos/link.png`,
          'generic': `${baseUrl}/logos/link.png`
        };
        return logos[platform] || null;
      };

      // Platform color map (matches frontend platformColorMap)
      const getPlatformColor = (platform) => {
        const colors = {
          'facebook': '#1877F2',
          'instagram': '#E4405F',
          'youtube': '#FF0000',
          'tiktok': '#000000',
          'x': '#000000',
          'twitter': '#1DA1F2',
          'linkedin': '#0077B5',
          'whatsapp': '#25D366',
          'telegram': '#26A5E4',
          'messenger': '#00B2FF',
          'snapchat': '#FFFC00',
          'pinterest': '#E60023',
          'reddit': '#FF4500',
          'github': '#333333',
          'spotify': '#1DB954',
          'venmo': '#008CFF',
          'wechat': '#07C160',
          'paypal': '#00457C',
          'bitcoin': '#F7931A',
          'link': '#00D9FF',
          'generic': '#555555'
        };
        return colors[platform] || '#555555';
      };

      // Split headline by "Social Media" text (matching preview behavior)
      const headlineParts = headline.includes('Social Media')
        ? [headline.replace('Social Media', '').trim(), 'Social Media']
        : [headline];

      const buttonsHtml = buttons.map(btn => {
        const platform = (btn.platform || btn.label || '').toLowerCase();
        const logoUrl = getLogoUrl(platform);
        const btnColor = btn.color || getPlatformColor(platform);

        return `
          <a href="${esc(btn.url)}"
             class="social-button"
             target="_blank"
             rel="noopener noreferrer"
             style="border-radius: 16px; --platform-color: ${btnColor};">
            <div class="button-left">
              ${logoUrl ? `<img src="${logoUrl}" alt="${esc(btn.label || btn.platform)}" class="platform-logo" />` : `<span class="platform-letter">${(btn.label || btn.platform || '?').charAt(0).toUpperCase()}</span>`}
              <span class="platform-name">${esc(btn.label || btn.platform)}</span>
            </div>
            <span class="visit-btn">Visit</span>
          </a>
        `;
      }).join('');

      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>${esc(headline)}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: ${fontFamily};
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 24px;
              background: ${pageColor};
              color: #000;
            }
            .container {
              width: 100%;
              max-width: 520px;
              animation: fadeIn 0.5s ease-in;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .page-content {
              padding: 40px 20px 32px;
            }
            .headline {
              font-size: 18px;
              font-weight: 700;
              color: #000;
              text-align: center;
              line-height: 1.2;
              margin-bottom: 20px;
            }
            .headline span {
              display: block;
            }
            .buttons {
              display: flex;
              flex-direction: column;
              gap: 12px;
              width: 100%;
            }
            .social-button {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 12px 16px;
              text-decoration: none;
              transition: transform 0.2s, box-shadow 0.2s;
              cursor: pointer;
              border-radius: 16px;
              background: rgba(255,255,255,0.25);
              color: #000;
              border: 1px solid rgba(255,255,255,0.4);
            }
            .social-button:hover {
              transform: translateY(-1px);
              box-shadow: 0 12px 30px rgba(0,0,0,0.12);
            }
            .button-left {
              display: flex;
              align-items: center;
              gap: 10px;
              flex: 1;
              min-width: 0;
            }
            .platform-logo {
              width: 24px;
              height: 24px;
              object-fit: contain;
            }
            .platform-letter {
              min-width: 24px;
              min-height: 24px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 4px;
              background: rgba(255,255,255,0.5);
              border-radius: 8px;
              color: #000;
              font-size: 12px;
              font-weight: 700;
            }
            .platform-name {
              font-size: 14px;
              color: #000;
              font-weight: 700;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .visit-btn {
              padding: 8px 14px;
              background: rgba(0,0,0,0.12);
              border-radius: 999px;
              color: #000;
              font-size: 12px;
              font-weight: 700;
              white-space: nowrap;
            }
            .footer {
              margin-top: 26px;
              font-size: 13px;
              color: #555;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="page-content">
              <div class="headline">
                ${headlineParts.map(part => `<span>${esc(part.trim())}</span>`).join('')}
              </div>
              <div class="buttons">
                ${buttonsHtml}
              </div>
              <div class="footer">
                <p>Powered by StiQR</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
  } catch (error) {
    console.error('Error serving social page:', error);
    res.status(500).send('Internal server error');
  }
});

// ============================================================
// POST /api/auth/google - Google OAuth callback (GIS/One Tap flow)
// This handles credential-based Google Sign-In from the frontend
// ============================================================
app.post('/api/auth/google', async (req, res) => {
  try {
    console.log('📊 === GOOGLE AUTH REQUEST RECEIVED ===');
    
    const { credential } = req.body;
    
    if (!credential) {
      console.error('❌ No credential provided');
      return res.status(400).json({ error: 'No credential provided' });
    }

    console.log('📊 Credential received, length:', credential.length);
    console.log('📊 Credential preview:', credential.substring(0, 50) + '...');

    // Verify the Google token
    let payload;
    try {
      // Import the library
      const { OAuth2Client } = require('google-auth-library');
      
      // Create client with your client ID
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      
      console.log('🔐 Verifying Google token with client ID:', process.env.GOOGLE_CLIENT_ID);
      
      // Verify the ID token
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      payload = ticket.getPayload();
      console.log('✅ Google token verified successfully');
      console.log('   Email:', payload.email);
      console.log('   Name:', payload.name);
      console.log('   Google ID:', payload.sub);
      
    } catch (verifyError) {
      console.error('❌ Google token verification failed:', verifyError.message);
      console.error('   Stack:', verifyError.stack);
      
      // Try alternative verification method
      try {
        console.log('🔄 Trying alternative verification...');
        const { OAuth2Client } = require('google-auth-library');
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        
        // Try with audience as an array
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: [process.env.GOOGLE_CLIENT_ID]
        });
        
        payload = ticket.getPayload();
        console.log('✅ Alternative verification succeeded!');
      } catch (altError) {
        console.error('❌ Alternative verification also failed:', altError.message);
        return res.status(401).json({ 
          error: 'Invalid Google token', 
          details: verifyError.message 
        });
      }
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user;
    try {
      console.log('📊 Checking if user exists:', email);
      user = await User.findOne({ email });
      
      if (!user) {
        // Create new user with Google account
        console.log('📝 Creating new user from Google account...');
        const username = email.split('@')[0] + Math.random().toString(36).substring(2, 6);
        
        user = new User({
          email,
          username,
          name: name || username,
          password: null,
          googleId: googleId,
          profileImage: picture || '',
          isGoogleUser: true,
          emailVerified: true,
          subscription: {
            plan: 'free',
            isActive: true,
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          },
          stats: {
            qrCodesCreated: 0,
            totalScans: 0
          }
        });

        await user.save();
        console.log(`✅ New user created via Google: ${email}`);
      } else {
        // Update existing user with Google info if needed
        let updated = false;
        if (!user.googleId) {
          user.googleId = googleId;
          updated = true;
        }
        if (!user.isGoogleUser) {
          user.isGoogleUser = true;
          updated = true;
        }
        if (!user.emailVerified) {
          user.emailVerified = true;
          updated = true;
        }
        if (picture && !user.profileImage) {
          user.profileImage = picture;
          updated = true;
        }
        if (updated) {
          await user.save();
          console.log(`✅ Existing user updated with Google info: ${email}`);
        } else {
          console.log(`✅ User logged in via Google: ${email}`);
        }
      }
    } catch (dbError) {
      console.error('❌ Database error:', dbError.message);
      return res.status(500).json({ 
        error: 'Database error', 
        details: dbError.message 
      });
    }

    // Generate JWT token
    let token;
    try {
      const jwt = require('jsonwebtoken');
      token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      console.log('✅ JWT token generated successfully');
    } catch (jwtError) {
      console.error('❌ JWT generation error:', jwtError.message);
      return res.status(500).json({ 
        error: 'Token generation error', 
        details: jwtError.message 
      });
    }

    // Return user data
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      name: user.name || user.username,
      profileImage: user.profileImage || '',
      subscription: user.subscription,
      isGoogleUser: user.isGoogleUser,
      createdAt: user.createdAt
    };

    console.log(`✅ Google authentication successful for: ${email}`);
    res.json({
      success: true,
      token,
      user: userData,
      message: 'Successfully authenticated with Google'
    });

  } catch (error) {
    console.error('❌ Fatal error in Google authentication:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Google authentication failed', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});



// Import routes
const authRoutes = require('./routes/auth');
const assetsRoutes = require('./routes/assets');
const stripeRoutes = require('./routes/stripe');
const eventRoutes = require('./routes/event');

// Use routes
app.use('/auth', authRoutes);
app.use('/api', assetsRoutes);
app.use('/api', stripeRoutes);
app.use('/', eventRoutes);


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});
