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

// Stripe webhook MUST use raw body before express.json() parses it
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Respond immediately to acknowledge receipt
  res.json({ received: true });

  // Process events asynchronously (don't block the response)
  try {
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('✅ Webhook: checkout.session.completed', session.id);

        const userId = session.metadata?.userId || session.client_reference_id;
        const plan = session.metadata?.plan || 'pro';

        if (userId) {
          // Retrieve the subscription from Stripe to get the actual current_period_end
          // session.expires_at is the checkout session expiry, NOT the subscription period end
          let currentPeriodEnd = null;
          try {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            if (session.subscription) {
              const subscription = await stripe.subscriptions.retrieve(session.subscription);
              currentPeriodEnd = new Date(subscription.current_period_end * 1000);
              console.log(`✅ Retrieved subscription period end: ${currentPeriodEnd.toISOString()}`);
            }
          } catch (stripeError) {
            console.error('❌ Failed to retrieve subscription from Stripe:', stripeError.message);
          }

          await User.findByIdAndUpdate(userId, {
            'subscription.plan': plan,
            'subscription.isActive': true,
            'subscription.stripeSubscriptionId': session.subscription,
            'subscription.stripeCustomerId': session.customer,
            'subscription.subscribedAt': new Date(),
            'subscription.stripeCurrentPeriodEnd': currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Fallback: 30 days from now
            'subscription.stripeCancelAtPeriodEnd': false
          });
          console.log(`✅ User ${userId} upgraded to ${plan}`);
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        console.log('✅ Webhook: invoice.paid', invoice.id);

        const subscriptionId = invoice.subscription;
        if (subscriptionId && db) {
          const usersCollection = db.collection('users');
          const user = await usersCollection.findOne({ 'subscription.stripeSubscriptionId': subscriptionId });
          if (user) {
            await usersCollection.updateOne(
              { _id: user._id },
              {
                $set: {
                  'subscription.stripeCurrentPeriodEnd': new Date(invoice.lines?.data?.[0]?.period?.end * 1000 || Date.now()),
                  'subscription.isActive': true
                }
              }
            );
            console.log(`✅ Subscription renewed for user ${user._id}`);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('✅ Webhook: customer.subscription.updated', subscription.id);

        if (db) {
          const usersCollection = db.collection('users');
          const user = await usersCollection.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
          if (user) {
            await usersCollection.updateOne(
              { _id: user._id },
              {
                $set: {
                  'subscription.stripeCurrentPeriodEnd': new Date(subscription.current_period_end * 1000),
                  'subscription.stripeCancelAtPeriodEnd': subscription.cancel_at_period_end,
                  'subscription.isActive': subscription.status === 'active' || subscription.status === 'trialing'
                }
              }
            );
            console.log(`✅ Subscription updated for user ${user._id}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        console.log('✅ Webhook: customer.subscription.deleted', subscription.id);

        if (db) {
          const usersCollection = db.collection('users');
          const user = await usersCollection.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
          if (user) {
            await usersCollection.updateOne(
              { _id: user._id },
              {
                $set: {
                  'subscription.plan': 'free',
                  'subscription.isActive': false,
                  'subscription.stripeSubscriptionId': null,
                  'subscription.stripeCancelAtPeriodEnd': false
                }
              }
            );
            console.log(`✅ Subscription cancelled for user ${user._id}`);
          }
        }
        break;
      }

      default:
        console.log(`ℹ️ Webhook: unhandled event type ${event.type}`);
    }
  } catch (processError) {
    console.error('❌ Error processing webhook event:', processError);
  }
});

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
        
        // Check menu_pages collection
        const menuPagesCollection = db.collection('menu_pages');
        const menuPage = await menuPagesCollection.findOne({ id });
        if (menuPage) {
          const menuUrl = `${req.protocol}://${host}/menu/${id}`;
          console.log(`✅ Redirecting to menu page: ${menuUrl}`);
          return res.redirect(menuUrl);
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
    const { id, data, type } = req.body;
    
    console.log('=== POST /qrcodes REQUEST RECEIVED ===');
    console.log('id:', id);
    console.log('data:', data ? data.substring(0, 100) : 'MISSING');
    console.log('type:', type || 'not provided');
    
    if (!id || !data) {
      return res.status(400).json({ error: 'Both id and data are required' });
    }
    
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    
    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }
    
    const collection = db.collection('qrcodes');
    
    // Build update object with optional type field
    const updateFields = {
      id: id,
      data: data,
      updatedAt: new Date()
    };
    
    // Store the type if provided (pdf, url, wifi, email, sms, whatsapp, social, event, menu)
    if (type) {
      updateFields.type = type;
    }
    
    // Upsert: insert if not exists, update if exists
    const result = await collection.updateOne(
      { id: id },
      { 
        $set: updateFields,
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
    console.log('   Type:', type || 'not set');
    
    res.json({
      success: true,
      message: 'QR code saved successfully',
      id: id,
      data: data,
      type: type
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
// Serve menu landing page HTML (before API routes)
// ============================================================
app.get('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching menu page: ${id}`);

    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    if (!db) {
      return res.status(500).send('Database configuration error');
    }

    const collection = db.collection('menu_pages');
    const menuPage = await collection.findOne({ id });

    if (!menuPage) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Menu Not Found</title>
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
            <h1>Menu Not Found</h1>
            <p>The menu you're looking for doesn't exist or has been removed.</p>
          </div>
        </body>
        </html>
      `);
    }

    const { title, summary, about, image, pdfFile, pdfFileName, businessHours, services, address, contact, pageColor } = menuPage;
    // ✅ Use the stored pdfUrl field (full URL) with a fallback to the pdfFile reference
    const pdfLink = menuPage.pdfUrl || `https://www.stiqr.top/api/pdf/${menuPage.pdfFile}`;
    // Fallback to the robust helper if no pdfUrl/pdfFile is present
    const resolvedPdfLink = pdfLink && !pdfLink.includes('undefined') ? pdfLink : require('./utils/menuPdf').getMenuPdfLink(menuPage, req);

    
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
        .map(([key, emoji]) => `<span title="${serviceLabels[key]}" class="service-icon">${emoji}</span>`);
      if (activeServices.length > 0) {
        servicesHtml = `<div class="services-row">${activeServices.join('')}</div>`;
      }
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>${title ? title + ' - Menu' : 'Menu'}</title>
        <meta name="description" content="${summary || 'Menu page'}">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@300;400;500;600;700;800&family=Nunito+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          :root {
            --bg-color: ${pageColor || '#f7f9fb'};
            --text-primary: #191c1e;
            --text-secondary: #3e4944;
            --text-muted: #6e7a74;
            --card-bg: #ffffff;
            --border-color: #e0e3e5;
            --accent: #4DB695;
            --surface-low: #f2f4f6;
          }
          
          body {
            font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-color);
            color: var(--text-primary);
            min-height: 100vh;
            line-height: 1.5;
            -webkit-font-smoothing: antialiased;
          }
          
          h1, h2, h3, h4, h5, h6 {
            font-family: 'Hanken Grotesk', sans-serif;
          }
          
          /* ===== Hero Section ===== */
          .hero {
            position: relative;
            height: 280px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          
          .hero-image {
            position: absolute;
            inset: 0;
            z-index: 0;
          }
          
          .hero-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to bottom, rgba(30, 48, 79, 0.3), rgba(30, 48, 79, 0.1));
            z-index: 1;
          }
          
          .hero-content {
            position: relative;
            z-index: 2;
            text-align: center;
            color: #fff;
            padding: 0 20px;
          }
          
          .hero-title {
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: clamp(28px, 6vw, 42px);
            font-weight: 700;
            line-height: 1.1;
            letter-spacing: -0.02em;
            text-shadow: 0 2px 20px rgba(0,0,0,0.3);
          }
          
          /* ===== Main Content ===== */
          .main-content {
            max-width: 640px;
            margin: 0 auto;
            padding: 0 16px;
            text-align: center;
          }
          
          /* ===== Cards ===== */
          .card {
            background: var(--card-bg);
            border-radius: 10px;
            padding: 20px;
            border: 1px solid var(--border-color);
            box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
          }
          
          .card:hover {
            transform: scale(1.03);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            cursor: pointer;
          }
          
          .card-title {
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 14px;
            font-weight: 700;
            color: #1E304F;
            margin-bottom: 8px;
          }
          
          .card-text {
            font-size: 12px;
            color: var(--text-secondary);
            line-height: 1.6;
          }
          
          .section-gap {
            padding: 8px 0;
          }
          
          .services-row {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 8px;
            justify-content: center;
          }
          
          .service-icon {
            font-size: 20px;
            filter: grayscale(100%);
          }
          
          /* ===== Footer ===== */
          .footer {
            padding: 24px 16px;
            text-align: center;
          }
          
          .footer .brand {
            font-family: 'Hanken Grotesk', sans-serif;
            font-size: 12px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 4px;
          }
          
          .footer p {
            font-size: 10px;
            color: var(--text-muted);
          }
          
          /* ===== Responsive ===== */
          @media (min-width: 768px) {
            .hero {
              height: 350px;
            }
            
            .main-content {
              padding: 0 24px;
            }
          }
        </style>
      </head>
      <body>
        <main>
          <!-- Hero Section - Image with Title overlay -->
          <section class="hero">
            <div class="hero-image">
              ${image ? `<img src="${image}" alt="${title || 'Menu'}">` : `<div style="width:100%;height:100%;background:linear-gradient(135deg, #1E304F, #2a4a7a);display:flex;align-items:center;justify-content:center;"><span style="font-size:60px;opacity:0.3;">🍽️</span></div>`}
              <div class="hero-overlay"></div>
            </div>
            <div class="hero-content">
              <h1 class="hero-title">${title || 'Menu'}</h1>
            </div>
          </section>
          
          <div class="main-content">
            <!-- Card 1: Menu Title + Summary -->
            <div class="section-gap" style="padding-top:16px;">
              <div class="card">
                <div style="font-size:18px;font-weight:700;font-family:'Hanken Grotesk',sans-serif;color:#1E304F;margin-bottom:8px;">
                  ${title || 'Menu Title'}
                </div>
                ${summary ? `<div style="font-size:13px;color:var(--text-secondary);line-height:1.5;">${summary}</div>` : ''}
              </div>
            </div>
            
            <!-- Card 2: Menu PDF -->
            ${pdfFileName ? `
              <div class="section-gap">
                <div class="card" style="text-align:center;">
                  <div class="card-title">Menu PDF</div>
                  <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
                    <span style="font-size:32px;">📄</span>
                    <div style="font-size:12px;color:var(--text-secondary);font-weight:600;">${pdfFileName}</div>
                    <a href="${resolvedPdfLink}" target="_blank" style="display:inline-block;padding:8px 20px;background:#1E304F;border-radius:20px;color:#fff;font-size:12px;font-weight:600;text-decoration:none;">View Menu PDF</a>

                  </div>
                </div>
              </div>
            ` : ''}
            
            <!-- Card 3: About -->
            ${about ? `
              <div class="section-gap">
                <div class="card">
                  <div class="card-title">About</div>
                  <div class="card-text">${about}</div>
                </div>
              </div>
            ` : ''}
            
            ${businessHours && Object.values(businessHours).some(h => h && (h.closed || h.morningOpen || h.morningClose || h.eveningOpen || h.eveningClose)) ? `
            <!-- Card: Business Hours -->
            <div class="section-gap">
              <div class="card">
                <div class="card-title" style="text-align:center;">Business Hours</div>
                <div style="display:flex;flex-direction:column;gap:4px;align-items:center;">
                  ${['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => {
                    const h = businessHours && businessHours[day] ? businessHours[day] : {};
                    const hasMorning = h.morningOpen && h.morningClose;
                    const hasEvening = h.eveningOpen && h.eveningClose;
                    const isClosed = !hasMorning && !hasEvening;
                    const dayLabel = day.charAt(0).toUpperCase() + day.slice(1,3);
                    return `<div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;padding:2px 0;border-bottom:1px solid rgba(0,0,0,0.04);width:100%;max-width:280px;">
                      <span style="font-weight:700;color:#1E304F;min-width:32px;">${dayLabel}</span>
                      <span style="color:${isClosed ? '#e74c3c' : 'var(--text-secondary)'};">
                        ${isClosed ? 'Closed' : ''}
                        ${!isClosed && hasMorning ? h.morningOpen + ' - ' + h.morningClose : ''}
                        ${!isClosed && hasMorning && hasEvening ? '  |  ' : ''}
                        ${!isClosed && hasEvening ? h.eveningOpen + ' - ' + h.eveningClose : ''}
                      </span>
                    </div>`;
                  }).join('')}
                </div>
              </div>
            </div>
            ` : ''}
            
            <!-- Card: Services -->
            ${servicesHtml ? `
              <div class="section-gap">
                <div class="card">
                  <div class="card-title">Services</div>
                  ${servicesHtml}
                </div>
              </div>
            ` : ''}
            
            <!-- Card 4: Address -->
            ${addressStr ? `
              <div class="section-gap">
                <div class="card">
                  <div class="card-title">Address</div>
                  <div class="card-text">${addressStr}</div>
                </div>
              </div>
            ` : ''}
            
            <!-- Card 5: Contacts -->
            ${(contact?.name || contact?.phone || contact?.email || contact?.website) ? `
              <div class="section-gap">
                <div class="card">
                  <div class="card-title">Contacts</div>
                  ${contact?.name ? `<div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:8px;">${contact.name}</div>` : ''}
                  <div style="display:flex;flex-direction:column;gap:6px;align-items:center;">
                    ${contact?.phone ? `<div style="font-size:12px;color:var(--text-secondary);">📞 ${contact.phone}</div>` : ''}
                    ${contact?.email ? `<div style="font-size:12px;color:var(--text-secondary);">✉️ ${contact.email}</div>` : ''}
                    ${contact?.website ? `<div style="font-size:12px;color:var(--text-secondary);">🌐 ${contact.website}</div>` : ''}
                  </div>
                </div>
              </div>
            ` : ''}
            
            <!-- Footer -->
            <footer class="footer">
              <div class="brand">${title || 'Menu'}</div>
              <p>Powered by Stiqr.top</p>
            </footer>
          </div>
        </main>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error serving menu page:', error);
    res.status(500).send('Internal server error');
  }
});

// ============================================================
// POST /api/auth/google - Google OAuth callback
// ============================================================
app.post('/api/auth/google', async (req, res) => {
  try {
    console.log('📊 === GOOGLE AUTH REQUEST RECEIVED ===');
    
    const { credential } = req.body;
    
    if (!credential) {
      console.error('❌ No credential provided');
      return res.status(400).json({ error: 'No credential provided' });
    }

    console.log('📊 Credential length:', credential.length);

    // Verify the Google token
    let payload;
    try {
      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      payload = ticket.getPayload();
      console.log('✅ Google token verified:', payload.email);
      
    } catch (verifyError) {
      console.error('❌ Token verification failed:', verifyError.message);
      return res.status(401).json({ 
        error: 'Invalid Google token', 
        details: verifyError.message 
      });
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Google account
      console.log('📝 Creating new user...');
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
      console.log(`✅ New user created: ${email}`);
    } else {
      // Update existing user with Google info
      let updated = false;
      
      // Only update if fields are missing
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
      if (!user.name && name) {
        user.name = name;
        updated = true;
      }
      
      if (updated) {
        await user.save();
        console.log(`✅ User updated with Google info: ${email}`);
      } else {
        console.log(`✅ User logged in via Google: ${email}`);
      }
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

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

    console.log(`✅ Google auth successful: ${email}`);
    res.json({
      success: true,
      token,
      user: userData,
      message: 'Successfully authenticated with Google'
    });

  } catch (error) {
    console.error('❌ Google auth error:', error);
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

// ============================================================
// PDF Upload/Download Routes - Direct MongoDB storage (no GridFS)
// For small files (under 1MB), store directly as Buffer in MongoDB
// ============================================================
const multer = require('multer');

// Use memory storage for direct Buffer access
const uploadPdf = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// POST /api/upload/pdf - Direct MongoDB storage (no GridFS)
// Returns a jobId so the frontend can poll for upload status
app.post('/api/upload/pdf', uploadPdf.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { qrCodeId } = req.body;
    
    // Generate a unique job ID
    const jobId = `pdf-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log('📄 PDF received:', {
      originalName: req.file.originalname,
      size: req.file.size,
      qrCodeId: qrCodeId,
      jobId: jobId
    });

    // Store job info in memory
    const job = {
      id: jobId,
      qrCodeId: qrCodeId,
      originalName: req.file.originalname,
      size: req.file.size,
      status: 'pending',
      createdAt: new Date()
    };

    if (!global.pdfJobs) global.pdfJobs = {};
    global.pdfJobs[jobId] = job;

    // Start background processing
    processPDFInBackground(jobId, req.file.buffer, req);

    // ✅ Return jobId so frontend can poll status
    res.json({
      success: true,
      jobId: jobId,
      message: 'PDF uploaded successfully. Processing in background.'
    });

  } catch (error) {
    console.error('❌ Error uploading PDF:', error);
    res.status(500).json({ error: 'Failed to upload PDF', details: error.message });
  }
});

// Background PDF processing function
async function processPDFInBackground(jobId, buffer, req) {
  try {
    const job = global.pdfJobs?.[jobId];
    if (!job) {
      console.error(`❌ Job ${jobId} not found`);
      return;
    }

    console.log(`🔄 Processing PDF job ${jobId}...`);
    console.log(`   QR Code ID: ${job.qrCodeId}`);
    console.log(`   File size: ${job.size} bytes`);

    // Update status to processing
    job.status = 'processing';

    // Store the file directly in MongoDB as binary
    const PDFFile = require('./models/PDFFile');
    const pdfRecord = await PDFFile.create({
      qrCodeId: job.qrCodeId,
      originalName: job.originalName,
      data: buffer,
      size: job.size,
      status: 'completed',
      createdAt: new Date()
    });

    // Generate a URL to access the PDF via the frontend
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.stiqr.top';
    const fileUrl = `${frontendUrl}/api/pdf/${pdfRecord._id}`;

    console.log(`✅ PDF saved directly to MongoDB: ${pdfRecord._id}`);
    console.log(`   URL: ${fileUrl}`);

    // Update the menu document with the PDF reference when available
    if (job.qrCodeId) {
      try {
        const db = mongoose.connection.db;
        if (db) {
          await db.collection('menu_pages').updateOne(
            { id: job.qrCodeId },
            {
              $set: {
                pdfFile: pdfRecord._id,
                pdfFileId: pdfRecord._id.toString(),
                // ✅ Store the full URL in the menu document
                pdfUrl: `${frontendUrl}/api/pdf/${pdfRecord._id}`,
                pdfFileName: job.originalName || 'menu.pdf',
                updatedAt: new Date()
              }
            },
            { upsert: false }
          );
        }
      } catch (menuUpdateError) {
        console.error('⚠️ Failed to update menu page with PDF reference:', menuUpdateError.message);

      }
    }

    // Update job with results
    job.status = 'completed';
    job.pdfId = pdfRecord._id.toString();
    job.fileUrl = fileUrl;
    job.completedAt = new Date();

    console.log(`✅ PDF job ${jobId} completed successfully`);

  } catch (error) {
    console.error(`❌ Error processing PDF job ${jobId}:`, error);
    const job = global.pdfJobs?.[jobId];
    if (job) {
      job.status = 'failed';
      job.error = error.message;
    }
  }
}

// GET /api/pdf/job/:jobId - Poll job status
app.get('/api/pdf/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = global.pdfJobs?.[jobId];

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      success: true,
      jobId: job.id,
      status: job.status,
      pdfId: job.pdfId || null,
      fileUrl: job.fileUrl || null,
      originalName: job.originalName,
      size: job.size,
      error: job.error || null,
      createdAt: job.createdAt,
      completedAt: job.completedAt || null
    });

  } catch (error) {
    console.error('❌ Error fetching job status:', error);
    res.status(500).json({ error: 'Failed to fetch job status' });
  }
});

// GET /api/pdf/:id - Stream PDF from MongoDB
app.get('/api/pdf/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📄 Streaming PDF: ${id}`);

    const db = mongoose.connection.db;
    const collection = db.collection('pdffiles');

    const doc = await collection.findOne({
      _id: new mongoose.Types.ObjectId(id)
    });

    if (!doc || !doc.data) {
      console.log(`❌ PDF not found: ${id}`);
      return res.status(404).json({ error: 'PDF not found' });
    }

    const pdfBuffer = doc.data.buffer;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.originalName || 'document.pdf'}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Stream the PDF in chunks to avoid timeouts
    const chunkSize = 64 * 1024; // 64KB chunks
    for (let i = 0; i < pdfBuffer.length; i += chunkSize) {
      const chunk = pdfBuffer.slice(i, i + chunkSize);
      res.write(chunk);
    }
    res.end();

    console.log(`✅ PDF streamed successfully: ${doc.originalName || 'document.pdf'}`);

  } catch (error) {
    console.error('❌ Error streaming PDF:', error);
    res.status(500).json({ error: 'Failed to serve PDF', details: error.message });
  }
});

// GET /api/pdf-by-name - Find PDF by original filename and serve inline
app.get('/api/pdf-by-name', async (req, res) => {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ error: 'name query parameter required' });

    console.log(`🔎 Looking up PDF by name: ${name}`);
    const PDFFile = require('./models/PDFFile');
    let pdfRecord = await PDFFile.findOne({ originalName: name });

    if (!pdfRecord) {
      // Fallback: case-insensitive partial match
      const regex = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      pdfRecord = await PDFFile.findOne({ originalName: { $regex: regex } });
    }

    if (!pdfRecord || !pdfRecord.data) {
      console.log(`❌ PDF not found by name: ${name}`);
      return res.status(404).json({ error: 'PDF not found' });
    }

    const pdfBuffer = Buffer.isBuffer(pdfRecord.data)
      ? pdfRecord.data
      : Buffer.from(pdfRecord.data.buffer || pdfRecord.data);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdfRecord.originalName || 'document.pdf'}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Stream in chunks
    const chunkSize = 64 * 1024;
    for (let i = 0; i < pdfBuffer.length; i += chunkSize) {
      res.write(pdfBuffer.slice(i, i + chunkSize));
    }
    res.end();

    console.log(`✅ Served PDF by name: ${pdfRecord.originalName}`);
  } catch (error) {
    console.error('❌ Error serving PDF by name:', error);
    res.status(500).json({ error: 'Failed to serve PDF', details: error.message });
  }
});

// GET /api/pdf-by-path - Proxy legacy uploads path and serve inline if file exists
app.get('/api/pdf-by-path', async (req, res) => {
  try {
    const p = req.query.path;
    if (!p || !p.startsWith('/uploads/')) return res.status(400).json({ error: 'invalid path' });

    const fs = require('fs');
    const localPath = path.join(__dirname, '..', 'frontend', 'public', p);
    if (!fs.existsSync(localPath)) {
      console.log(`❌ Uploads file not found: ${localPath}`);
      return res.status(404).json({ error: 'File not found' });
    }

    const data = fs.readFileSync(localPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(localPath)}"`);
    res.setHeader('Content-Length', data.length);

    const chunkSize = 64 * 1024;
    for (let i = 0; i < data.length; i += chunkSize) {
      res.write(data.slice(i, i + chunkSize));
    }
    res.end();

    console.log(`✅ Served uploads PDF: ${localPath}`);
  } catch (error) {
    console.error('❌ Error serving PDF by path:', error);
    res.status(500).json({ error: 'Failed to serve PDF', details: error.message });
  }
});

// GET /api/menu-pdf/:menuId - Serve menu PDF stored in menu_pages (data URI) inline
app.get('/api/menu-pdf/:menuId', async (req, res) => {
  try {
    const { menuId } = req.params;
    console.log(`📄 Serving menu PDF for menuId: ${menuId}`);

    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const collection = db.collection('menu_pages');
    const doc = await collection.findOne({ id: menuId });

    let pdfBuffer = null;
    let filename = doc?.pdfFileName || 'menu.pdf';

    if (doc?.pdfFileId) {
      const PDFFile = require('./models/PDFFile');
      const pdfRecord = await PDFFile.findById(doc.pdfFileId);
      if (pdfRecord?.data) {
        pdfBuffer = Buffer.isBuffer(pdfRecord.data) ? pdfRecord.data : Buffer.from(pdfRecord.data.buffer || pdfRecord.data);
        filename = pdfRecord.originalName || filename;
      }
    }

    if (!pdfBuffer && doc?.pdfFile) {
      const pdfReference = typeof doc.pdfFile === 'string' ? doc.pdfFile.trim() : doc.pdfFile?.toString?.();
      if (pdfReference && /^[a-fA-F0-9]{24}$/.test(pdfReference)) {
        const PDFFile = require('./models/PDFFile');
        const pdfRecord = await PDFFile.findById(pdfReference);
        if (pdfRecord?.data) {
          pdfBuffer = Buffer.isBuffer(pdfRecord.data) ? pdfRecord.data : Buffer.from(pdfRecord.data.buffer || pdfRecord.data);
          filename = pdfRecord.originalName || filename;
        }
      } else if (Buffer.isBuffer(doc.pdfFile)) {
        pdfBuffer = doc.pdfFile;
      } else if (typeof doc.pdfFile === 'string') {
        const commaIndex = doc.pdfFile.indexOf(',');
        const base64String = commaIndex >= 0 ? doc.pdfFile.slice(commaIndex + 1) : doc.pdfFile;
        pdfBuffer = Buffer.from(base64String, 'base64');
      }
    }

    if (!pdfBuffer) {
      console.log(`❌ Menu PDF not found for menuId: ${menuId}`);
      return res.status(404).json({ error: 'PDF not found' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.pdfFileName || 'menu.pdf'}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Stream in chunks to avoid large single writes
    const chunkSize = 64 * 1024;
    for (let i = 0; i < pdfBuffer.length; i += chunkSize) {
      res.write(pdfBuffer.slice(i, i + chunkSize));
    }
    res.end();

    console.log(`✅ Menu PDF served inline for menuId: ${menuId}`);
  } catch (error) {
    console.error('❌ Error serving menu PDF:', error);
    res.status(500).json({ error: 'Failed to serve PDF', details: error.message });
  }
});


// DELETE /api/pdf/:id - Delete PDF from MongoDB
app.delete('/api/pdf/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const PDFFile = require('./models/PDFFile');
    const result = await PDFFile.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ error: 'PDF not found' });
    }
    
    console.log('🗑️ PDF deleted from MongoDB:', id);
    res.json({ success: true, message: 'PDF deleted successfully' });

  } catch (error) {
    console.error('❌ Error deleting PDF:', error);
    res.status(500).json({ error: 'Failed to delete PDF' });
  }
});


// ============================================================
// POST /api/contact - Contact form email sending via Mailtrap API
// ============================================================
app.post('/api/contact', async (req, res) => {

  try {

    const { name, email, message } = req.body;



    console.log('📧 Contact form submission:', { name, email, message });

    // Validate
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Check API token
    if (!process.env.MAILTRAP_API_TOKEN) {
      console.error('❌ MAILTRAP_API_TOKEN not set');
      return res.status(500).json({ error: 'Email service not configured.' });
    }

    // Initialize Mailtrap client
    const { MailtrapClient } = require('mailtrap');
    const client = new MailtrapClient({
      token: process.env.MAILTRAP_API_TOKEN,
      endpoint: 'https://send.api.mailtrap.io'
    });

    const sender = {
      email: 'support@stiqr.top',
      name: 'StiQR Support'
    };

    const recipients = [
      { email: 'support@stiqr.top' }
    ];

    const response = await client.send({
      from: sender,
      to: recipients,
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>This message was sent from the StiQR contact form.</small></p>
      `,
      reply_to: { email: email, name: name }
    });

    console.log('✅ Email sent via Mailtrap API');
    console.log('   Message ID:', response?.id || 'N/A');

    res.json({
      success: true,
      message: 'Your message has been sent successfully! We\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({
      error: 'Failed to send email. Please try again later.'
    });
  }
});

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
