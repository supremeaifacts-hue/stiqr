const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const passport = require('./config/passport');
const { connectDB } = require('./config/database');
const authRoutes = require('./routes/auth');
const assetsRoutes = require('./routes/assets');
const stripeRoutes = require('./routes/stripe');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174,http://localhost:5175').split(',');
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Stripe webhook - MUST be defined BEFORE express.json()
app.post('/api/webhook', 
  express.raw({type: 'application/json'}), 
  async (req, res) => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const User = require('./models/User');
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    console.log('📦 Webhook received');
    console.log('   Headers:', Object.keys(req.headers));
    console.log('   Body type:', typeof req.body);
    console.log('   Is Buffer:', Buffer.isBuffer(req.body));
    
    if (!webhookSecret) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not set in .env');
      return res.status(500).send('Webhook secret not configured');
    }
    
    if (!sig) {
      console.error('❌ No stripe-signature header');
      return res.status(400).send('No signature header');
    }
    
    try {
      // Construct the event using the raw body Buffer
      const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      console.log('✅ Webhook verified:', event.type);
      
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          
          // ADDED LOGS FOR DEBUGGING
          console.log('=== WEBHOOK RECEIVED ===');
          console.log('Event type:', event.type);
          console.log('Session client_reference_id:', session.client_reference_id);
          console.log('Session metadata:', session.metadata);
          
          console.log('💰 Payment successful for:', session.customer_email);
          console.log('   Customer ID:', session.customer);
          console.log('   Subscription ID:', session.subscription);
          
          // Get user ID from client_reference_id
          const userId = session.client_reference_id;
          
          if (!userId) {
            console.error('❌ No user ID found in session');
            console.error('   client_reference_id:', session.client_reference_id);
            console.error('   metadata:', session.metadata);
            return res.status(400).send('Missing user ID');
          }
          
          console.log('   Found user ID from client_reference_id:', userId);
          console.log('   Plan from metadata:', session.metadata?.plan || session.metadata?.planType);
          console.log('   Customer ID:', session.customer);
          console.log('   Subscription ID:', session.subscription);
          
          // ADDED LOG: Looking for user with ID
          console.log('Looking for user with ID:', userId);
          
          // Update the user in MongoDB
          const user = await User.findByIdAndUpdate(
            userId,
            {
              'subscription.stripeCustomerId': session.customer,
              'subscription.plan': session.metadata?.plan || session.metadata?.planType || 'pro',
              'subscription.isActive': true,
              'subscription.subscribedAt': new Date(),
              'subscription.stripeCurrentPeriodEnd': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            { new: true }
          );
          
          // ADDED LOG: User found?
          console.log('User found?', user ? 'Yes' : 'No');
          
          if (user) {
            console.log(`✅ User ${user.email} upgraded to ${user.subscription?.plan || 'pro'}`);
          } else {
            console.error(`❌ User not found with ID: ${userId}`);
          }
          break;
          
        case 'customer.subscription.deleted':
          console.log('📋 Subscription cancelled');
          // Handle cancellation
          break;
          
        default:
          console.log(`📋 Unhandled event type: ${event.type}`);
      }
      
      res.json({received: true});
    } catch (err) {
      console.error('❌ Webhook error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// JSON parsing middleware for all other routes (must come AFTER webhook route)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// TRACKING ENDPOINT: /track/:id
// Called by the EdgeOne function to look up QR code destination.
// Returns JSON with the destination URL.
// The EdgeOne function handles the final redirect to the user's browser.
// MUST be BEFORE passport middleware (no auth required).
// ============================================================
app.get('/track/:id', async (req, res) => {
  const startTime = Date.now();
  try {
    const { id } = req.params;
    
    console.log('========================================');
    console.log('🔍 TRACKING ENDPOINT CALLED');
    console.log('========================================');
    console.log(`   ID:            ${id}`);
    console.log(`   Timestamp:     ${new Date().toISOString()}`);
    console.log(`   IP:            ${req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress}`);
    console.log(`   User-Agent:    ${req.headers['user-agent'] || 'unknown'}`);
    console.log(`   Referer:       ${req.headers['referer'] || 'none'}`);
    console.log('========================================');
    
    // Import User model
    const User = require('./models/User');
    
    // ============================================================
    // STEP 1: Find user by QR code ID
    // ============================================================
    console.log('📡 STEP 1: Searching for QR code in database...');
    console.log(`   Query: User.findOne({ 'qrCodes.id': '${id}' })`);
    
    const user = await User.findOne({ 'qrCodes.id': id });
    
    if (!user) {
      console.error(`❌ STEP 1 FAILED: No user found containing QR code with ID: ${id}`);
      console.log('========================================\n');
      return res.status(404).json({ 
        success: false, 
        error: 'QR code not found',
        id: id,
        message: `No QR code found with ID "${id}"`
      });
    }
    
    console.log(`✅ STEP 1 PASSED: Found user ${user.email} (ID: ${user._id})`);
    console.log(`   User has ${user.qrCodes ? user.qrCodes.length : 0} QR codes`);
    
    // ============================================================
    // STEP 2: Find the specific QR code in the user's array
    // ============================================================
    console.log('📡 STEP 2: Finding specific QR code in user array...');
    
    const qrCode = user.qrCodes.find(qr => qr.id === id);
    
    if (!qrCode) {
      console.error(`❌ STEP 2 FAILED: QR code with ID ${id} not found in user's qrCodes array`);
      console.log('========================================\n');
      return res.status(404).json({ 
        success: false, 
        error: 'QR code data not found',
        id: id,
        message: `QR code with ID "${id}" exists but has no data`
      });
    }
    
    console.log(`✅ STEP 2 PASSED: QR code found`);
    console.log(`   Name:          ${qrCode.name || '(no name)'}`);
    console.log(`   Destination:   ${qrCode.data || '(EMPTY!)'}`);
    console.log(`   Scan count:    ${qrCode.scans || 0}`);
    console.log(`   Created:       ${qrCode.createdAt || 'unknown'}`);
    console.log(`   Last scanned:  ${qrCode.lastScanned || 'never'}`);
    
    // ============================================================
    // STEP 3: Validate destination URL
    // ============================================================
    console.log('📡 STEP 3: Validating destination URL...');
    
    if (!qrCode.data || qrCode.data.trim() === '') {
      console.error(`❌ STEP 3 FAILED: QR code has empty destination data`);
      console.log('========================================\n');
      return res.status(400).json({ 
        success: false, 
        error: 'QR code has no destination',
        id: id,
        message: 'This QR code does not have a destination URL configured'
      });
    }
    
    console.log(`✅ STEP 3 PASSED: Destination URL is valid`);
    console.log(`   Raw data:      ${qrCode.data}`);
    
    // ============================================================
    // STEP 4: Increment scan count in background (don't await)
    // ============================================================
    console.log('📡 STEP 4: Incrementing scan count (background)...');
    
    qrCode.scans = (qrCode.scans || 0) + 1;
    qrCode.lastScanned = new Date();
    
    // Save asynchronously - don't block the response
    user.save().then(() => {
      console.log(`✅ STEP 4 COMPLETE: Scan count updated to ${qrCode.scans}`);
    }).catch(err => {
      console.error(`⚠️ STEP 4 FAILED: Could not save scan count: ${err.message}`);
    });
    
    // ============================================================
    // STEP 5: Return destination URL as JSON
    // ============================================================
    const elapsed = Date.now() - startTime;
    console.log('========================================');
    console.log('✅ TRACKING ENDPOINT SUCCESS');
    console.log(`   Total time:    ${elapsed}ms`);
    console.log(`   Destination:   ${qrCode.data}`);
    console.log(`   Returning:     { "destination": "${qrCode.data}" }`);
    console.log('========================================\n');
    
    // Return JSON with destination URL
    // The EdgeOne function will handle the 302 redirect to the user's browser
    res.json({ 
      destination: qrCode.data,
      id: qrCode.id,
      name: qrCode.name
    });
    
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error('========================================');
    console.error('💥 TRACKING ENDPOINT ERROR');
    console.error(`   Time elapsed:  ${elapsed}ms`);
    console.error(`   Error name:    ${error.name || 'unknown'}`);
    console.error(`   Error message: ${error.message || 'unknown'}`);
    console.error(`   Error stack:   ${error.stack || 'no stack trace'}`);
    console.error('========================================\n');
    
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware to log all API requests and ensure JSON responses
app.use((req, res, next) => {
  // Store the original json method
  const originalJson = res.json;
  
  // Override json method to log responses
  res.json = function(data) {
    console.log(`[API Response] ${req.method} ${req.originalUrl}`);
    console.log(`  Status: ${res.statusCode}`);
    console.log(`  Response type: ${typeof data}`);
    
    // Log error responses in detail
    if (res.statusCode >= 400) {
      console.log(`  Error response:`, JSON.stringify(data, null, 2));
    }
    
    // Call the original json method
    return originalJson.call(this, data);
  };
  
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', assetsRoutes);
app.use('/api/stripe', stripeRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'StickerQR backend running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes placeholder
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Stripe configuration test endpoint
app.get('/api/test-stripe', (req, res) => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeProPriceId = process.env.STRIPE_PRO_PRICE_ID;
  const stripeUltraPriceId = process.env.STRIPE_ULTRA_PRICE_ID;
  
  res.json({
    stripe: {
      secretKey: {
        exists: !!stripeSecretKey,
        length: stripeSecretKey ? stripeSecretKey.length : 0,
        first10Chars: stripeSecretKey ? stripeSecretKey.substring(0, 10) : null,
        startsWithSkTest: stripeSecretKey ? stripeSecretKey.startsWith('sk_test_') : false,
        isValidFormat: stripeSecretKey ? /^sk_(test|live)_[a-zA-Z0-9]+$/.test(stripeSecretKey) : false
      },
      publishableKey: {
        exists: !!stripePublishableKey,
        length: stripePublishableKey ? stripePublishableKey.length : 0,
        first10Chars: stripePublishableKey ? stripePublishableKey.substring(0, 10) : null,
        startsWithPkTest: stripePublishableKey ? stripePublishableKey.startsWith('pk_test_') : false
      },
      webhookSecret: {
        exists: !!stripeWebhookSecret,
        length: stripeWebhookSecret ? stripeWebhookSecret.length : 0
      },
      priceIds: {
        pro: {
          exists: !!stripeProPriceId,
          value: stripeProPriceId ? stripeProPriceId : null
        },
        ultra: {
          exists: !!stripeUltraPriceId,
          value: stripeUltraPriceId ? stripeUltraPriceId : null
        }
      },
      domain: process.env.DOMAIN || 'Not configured'
    },
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`Google OAuth Callback: ${process.env.GOOGLE_CALLBACK_URL || 'Not configured'}`);
});
