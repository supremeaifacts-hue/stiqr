const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');

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
// Serve social media landing page HTML (before API routes)
// ============================================================
app.get('/social/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching social page: ${id}`);

    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      return res.status(500).send('Database configuration error');
    }

    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db('stiqr');
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
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
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
             style="background-color: ${btnColor}; border-radius: 50px;"
             target="_blank"
             rel="noopener noreferrer">
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
              background-color: ${pageColor};
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 20px;
            }
            .container {
              max-width: 500px;
              width: 100%;
              text-align: center;
              animation: fadeIn 0.5s ease-in;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .headline {
              font-size: 16px;
              font-weight: 700;
              color: #000;
              text-align: center;
              line-height: 1.2;
              margin-bottom: 15px;
            }
            .headline span {
              display: block;
            }
            .buttons {
              display: flex;
              flex-direction: column;
              gap: 8px;
              width: 100%;
            }
            .social-button {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 10px 16px;
              text-decoration: none;
              transition: transform 0.2s, box-shadow 0.2s;
              cursor: pointer;
              border: none;
            }
            .social-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .social-button:active {
              transform: translateY(0);
            }
            .button-left {
              display: flex;
              align-items: center;
              gap: 10px;
              flex: 1;
            }
            .platform-logo {
              width: 24px;
              height: 24px;
              object-fit: contain;
              filter: brightness(0) invert(1);
            }
            .platform-letter {
              width: 24px;
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              font-size: 14px;
              font-weight: 700;
            }
            .platform-name {
              font-size: 14px;
              color: #fff;
              font-weight: 600;
            }
            .visit-btn {
              padding: 6px 14px;
              background: rgba(255, 255, 255, 0.25);
              border: none;
              border-radius: 20px;
              color: #fff;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
            }
            .footer {
              margin-top: 40px;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="headline">
              ${headlineParts.map(part => `<span>${esc(part.trim())}</span>`).join('')}
            </div>
            <div class="buttons">
              ${buttonsHtml}
            </div>
            <div class="footer">
              <p>Scan to connect</p>
            </div>
          </div>
        </body>
        </html>
      `);
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error('Error serving social page:', error);
    res.status(500).send('Internal server error');
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
