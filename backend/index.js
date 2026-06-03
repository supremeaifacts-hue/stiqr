const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'stiqr-jwt-secret-dev';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stiqr';

// ─── MongoDB Connection ───────────────────────────────────────────────────────
let db = null;
let usersCollection = null;

async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    // ⚠️ IMPORTANT: Explicitly use the 'stiqr' database
    db = client.db('stiqr');
    usersCollection = db.collection('users');
    console.log('✅ Connected to MongoDB database: stiqr');
    return client;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.warn('⚠️ Running with in-memory fallback (data will not persist)');
    return null;
  }
}

// ─── In-Memory Data Stores (fallback) ─────────────────────────────────────────
const memUsers = {};        // email -> { email, password, name, createdAt, subscription }
const qrCodes = {};         // id -> { id, destination, qrCodeData, qrImageData, design, name, userId, scan_count, createdAt }
const stickers = {};        // id -> { id, data, name, category, userId, createdAt }
const logos = {};           // id -> { id, data, name, userId, createdAt }
const scans = [];           // array of scan objects
let stickerIdCounter = 1;
let logoIdCounter = 1;

// ─── Utility Functions ────────────────────────────────────────────────────────

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, data) {
  const json = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-email',
  });
  res.end(json);
}

function sendRedirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function parseURL(req) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  return url;
}

function matchPath(pattern, pathname) {
  const regexStr = pattern.replace(/:([^/]+)/g, '([^/]+)');
  const regex = new RegExp(`^${regexStr}$`);
  const match = pathname.match(regex);
  if (match) {
    const params = {};
    const paramNames = [...pattern.matchAll(/:([^/]+)/g)].map(m => m[1]);
    paramNames.forEach((name, i) => {
      params[name] = match[i + 1];
    });
    return params;
  }
  return null;
}

function getUserFromAuthHeader(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (e) {
    return null;
  }
}

// ─── Helper: Get text color based on background brightness ────────────────────
function getTextColorForBg(hexColor) {
  // Default to dark text if we can't parse
  if (!hexColor) return '#000000';
  
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // If any value is NaN, return default
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#000000';
  
  // Calculate luminance (relative brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return dark text for light backgrounds, white text for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// ─── Helper: Escape HTML to prevent XSS ───────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}
// ─── QR Type Detection ────────────────────────────────────────────────────────
function detectQrType(destination) {
  if (!destination) return 'url';
  if (destination.startsWith('WIFI:S:')) return 'wifi';
  if (destination.startsWith('PDF:')) return 'pdf';
  if (destination.startsWith('mailto:')) return 'email';
  if (destination.startsWith('sms:')) return 'sms';
  if (destination.startsWith('https://wa.me/')) return 'whatsapp';
  if (destination && destination.includes('/social/')) return 'social';
  return 'url';
}

// ─── Route Handler ────────────────────────────────────────────────────────────

async function handleRequest(req, res) {
  const url = parseURL(req);
  const pathname = url.pathname;
  const method = req.method.toUpperCase();

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-email, Stripe-Signature',
      'Access-Control-Max-Age': '86400',
    });
    return res.end();
  }

  console.log(`${method} ${pathname}`);

  // ── Authentication Middleware ──────────────────────────────────────────────
  // Decode JWT and set req.user before any route logic
  // Skip auth for webhook and public endpoints
  const isPublicEndpoint =
    pathname === '/api/webhook' ||
    pathname === '/auth/status' ||
    pathname === '/auth/user' ||
    pathname === '/me' ||
    pathname === '/auth/signup' ||
    pathname === '/auth/login' ||
    pathname.startsWith('/track/') ||
    pathname.startsWith('/qrcodes/') ||
    pathname === '/api/qrcodes/all' ||
    pathname.startsWith('/social/') ||
    pathname.startsWith('/api/social-pages/');



  if (!isPublicEndpoint) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        console.log(`✅ Authenticated user ${req.user.email} for ${method} ${pathname}`);
      } catch (err) {
        console.log(`❌ Token verification failed for ${method} ${pathname}: ${err.message}`);
        req.user = null;
      }
    } else {
      console.log(`❌ No valid auth header for ${method} ${pathname}`);
      req.user = null;
    }
  } else {
    req.user = null;
  }

  try {

    // ── Stripe Webhook ───────────────────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/webhook') {
      // Read raw body for Stripe signature verification
      const rawBody = await new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => resolve(body));
        req.on('error', reject);
      });

      const sig = req.headers['stripe-signature'];
      let event;

      try {
        event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return sendJSON(res, 400, { error: `Webhook Error: ${err.message}` });
      }

      console.log(`✅ Webhook received: ${event.type}`);

      // Handle the checkout.session.completed event
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const clientReferenceId = session.client_reference_id;
        const customerEmail = session.customer_email;

        // Determine plan type from metadata
        let planType = 'pro';
        if (session.metadata && session.metadata.plan) {
          planType = session.metadata.plan;
        }

        const userEmail = customerEmail || clientReferenceId;

        if (userEmail && usersCollection) {
          // Find user by email (case-insensitive) in the stiqr database
          const user = await usersCollection.findOne({
            email: { $regex: new RegExp(`^${userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
          });

          if (user) {
            // Update existing user in MongoDB
            await usersCollection.updateOne(
              { _id: user._id },
              {
                $set: {
                  subscriptionStatus: 'active',
                  planType: planType,
                  stripeSubscriptionId: session.subscription,
                  stripeSessionId: session.id,
                  stripeCustomerId: session.customer,
                  subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  updatedAt: new Date().toISOString()
                }
              }
            );
            console.log(`✅ Updated existing user in stiqr.users: ${user.email} -> ${planType}`);
          } else {
            console.log(`⚠️ User not found in stiqr.users: ${userEmail}`);
          }
        } else if (userEmail) {
          // Fallback: update in-memory store
          const lowerEmail = userEmail.toLowerCase();
          for (const key of Object.keys(memUsers)) {
            if (key.toLowerCase() === lowerEmail) {
              memUsers[key].subscription = {
                planType,
                subscriptionStatus: 'active',
                stripeSubscriptionId: session.subscription,
                stripeSessionId: session.id,
                stripeCustomerId: session.customer,
                subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
              };
              console.log(`✅ Updated in-memory user: ${key} -> ${planType}`);
              break;
            }
          }
        }
      }

      // Handle subscription updates
      if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        const isDeleted = event.type === 'customer.subscription.deleted';

        if (usersCollection) {
          // Find user by stripe subscription ID in MongoDB
          const user = await usersCollection.findOne({
            stripeSubscriptionId: subscription.id
          });

          if (user) {
            if (isDeleted) {
              await usersCollection.updateOne(
                { _id: user._id },
                {
                  $set: {
                    subscriptionStatus: 'canceled',
                    planType: 'free',
                    updatedAt: new Date().toISOString()
                  }
                }
              );
              console.log(`❌ Subscription canceled for ${user.email}`);
            } else {
              const endDate = subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000).toISOString()
                : null;
              await usersCollection.updateOne(
                { _id: user._id },
                {
                  $set: {
                    subscriptionStatus: subscription.status === 'active' ? 'active' : 'incomplete',
                    subscriptionEndDate: endDate,
                    updatedAt: new Date().toISOString()
                  }
                }
              );
              console.log(`🔄 Subscription updated for ${user.email}: ${subscription.status}`);
            }
          }
        } else {
          // Fallback: update in-memory store
          for (const email of Object.keys(memUsers)) {
            if (memUsers[email].subscription?.stripeSubscriptionId === subscription.id) {
              if (isDeleted) {
                memUsers[email].subscription.subscriptionStatus = 'canceled';
                memUsers[email].subscription.planType = 'free';
              } else {
                memUsers[email].subscription.subscriptionStatus = subscription.status === 'active' ? 'active' : 'incomplete';
                const endDate = subscription.current_period_end
                  ? new Date(subscription.current_period_end * 1000).toISOString()
                  : null;
                memUsers[email].subscription.subscriptionEndDate = endDate;
              }
              break;
            }
          }
        }
      }

      return sendJSON(res, 200, { received: true });
    }

    // ── Stripe Checkout Session ──────────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/create-checkout-session') {
      const body = await parseBody(req);
      const { priceId, userId, userEmail } = body;

      if (!priceId) {
        return sendJSON(res, 400, { error: 'priceId is required' });
      }

      // Use email as fallback if userId is empty
      const clientReferenceId = userId && userId !== '' ? userId : userEmail;

      if (!clientReferenceId) {
        return sendJSON(res, 400, { error: 'User identification required' });
      }

      // Determine plan type from price ID
      let planType = 'pro';
      if (priceId === process.env.STRIPE_ULTRA_PRICE_ID) {
        planType = 'ultra';
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: 'https://www.stiqr.top/dashboard?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: 'https://www.stiqr.top/pricing',
        client_reference_id: clientReferenceId,
        customer_email: userEmail,
        metadata: {
          plan: planType
        }
      });

      console.log('✅ Checkout session created:', session.id);
      return sendJSON(res, 200, { url: session.url });
    }

    // ── Auth: Signup ─────────────────────────────────────────────────────────
    if (method === 'POST' && pathname === '/auth/signup') {
      const body = await parseBody(req);
      const { email, password, name } = body;

      if (!email || !password) {
        return sendJSON(res, 400, { error: 'Email and password are required' });
      }

      if (usersCollection) {
        // Check if user exists in MongoDB
        const existing = await usersCollection.findOne({ email: email.toLowerCase() });
        if (existing) {
          return sendJSON(res, 400, { error: 'User already exists' });
        }
        // Store in MongoDB
        await usersCollection.insertOne({
          email: email.toLowerCase(),
          password,
          name: name || email.split('@')[0],
          createdAt: new Date().toISOString()
        });
      } else {
        // Fallback to in-memory
        if (memUsers[email]) {
          return sendJSON(res, 400, { error: 'User already exists' });
        }
        memUsers[email] = {
          email,
          password,
          name: name || email.split('@')[0],
          createdAt: new Date().toISOString()
        };
      }

      console.log(`✅ User created: ${email}`);
      return sendJSON(res, 200, { success: true, message: 'User created', email });
    }

    // ── Auth: Login ──────────────────────────────────────────────────────────
    if (method === 'POST' && pathname === '/auth/login') {
      const body = await parseBody(req);
      const { email, password } = body;

      let user = null;

      if (usersCollection) {
        user = await usersCollection.findOne({ email: email.toLowerCase() });
      } else {
        user = memUsers[email];
      }

      if (!user || user.password !== password) {
        return sendJSON(res, 401, { error: 'Invalid credentials' });
      }

      // Generate JWT token for the frontend to use
      const token = jwt.sign(
        {
          id: user._id ? user._id.toString() : user.email,
          email: user.email
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log(`✅ Login successful for ${user.email}, token generated`);

      // Determine trial info
      let trialEndsAt = null;
      let trialStartedAt = null;
      if (user.createdAt) {
        trialStartedAt = user.createdAt;
        // Trial ends 7 days after creation
        const trialEnd = new Date(user.createdAt);
        trialEnd.setDate(trialEnd.getDate() + 7);
        trialEndsAt = trialEnd.toISOString();
      } else {
        trialStartedAt = new Date().toISOString();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 7);
        trialEndsAt = trialEnd.toISOString();
      }

      return sendJSON(res, 200, {
        success: true,
        user: {
          id: user._id ? user._id.toString() : null,
          email: user.email,
          name: user.name || user.email.split('@')[0],
          subscription: {
            plan: 'free',
            trialStartedAt: trialStartedAt,
            trialEndsAt: trialEndsAt,
            isActive: true
          }
        },
        token: token  // ← CRITICAL: frontend stores this as jwtToken
      });
    }

    // ── Auth: Status ─────────────────────────────────────────────────────────
    if (method === 'GET' && pathname === '/auth/status') {
      return sendJSON(res, 200, { authenticated: false });
    }

    // ── Auth: User info ──────────────────────────────────────────────────────
    if (method === 'GET' && pathname === '/auth/user') {
      return sendJSON(res, 200, { user: null });
    }

    // ── Me ───────────────────────────────────────────────────────────────────
    if (method === 'GET' && pathname === '/me') {
      return sendJSON(res, 200, { user: null });
    }

    // ── User Subscription ────────────────────────────────────────────────────
    if (method === 'GET' && pathname === '/api/user/subscription') {
      // Debug: log all incoming headers
      console.log('📨 Headers received:', JSON.stringify(req.headers));
      console.log('🔑 Authorization header:', req.headers.authorization ? req.headers.authorization.substring(0, 50) + '...' : 'NOT SET');
      console.log('📧 User email header:', req.headers['x-user-email'] || 'NOT SET');

      // Get user from req.user (set by auth middleware)
      let userId = req.user?.id || req.user?.userId || null;
      let userEmail = req.user?.email || null;


      // Fallback to x-user-email header
      if (!userEmail) {
        userEmail = req.headers['x-user-email'] || null;
      }

      console.log(`📊 Subscription check: userId=${userId}, email=${userEmail}`);

      let user = null;

      if (usersCollection) {
        // Try to find by MongoDB _id first (from JWT token)
        if (userId) {
          try {
            user = await usersCollection.findOne({ _id: new ObjectId(userId) });
          } catch (e) {
            console.log('⚠️ Invalid ObjectId format:', userId);
          }
        }

        // Fallback to email lookup
        if (!user && userEmail) {
          user = await usersCollection.findOne(
            { email: { $regex: new RegExp(`^${userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
          );
        }

        if (user) {
          console.log(`📊 Subscription for ${user.email}: status=${user.subscriptionStatus}, plan=${user.planType}`);
          
          // Calculate trial info from createdAt
          let trialStartedAt = user.createdAt || null;
          let trialEndsAt = null;
          if (trialStartedAt) {
            const trialEnd = new Date(trialStartedAt);
            trialEnd.setDate(trialEnd.getDate() + 7);
            trialEndsAt = trialEnd.toISOString();
          }
          
          return sendJSON(res, 200, {
            subscriptionStatus: user.subscriptionStatus || 'free',
            planType: user.planType || 'free',
            subscriptionEndDate: user.subscriptionEndDate || null,
            updatedAt: user.updatedAt || null,
            trialStartedAt: trialStartedAt,
            trialEndsAt: trialEndsAt
          });
        }
      } else {
        // Fallback to in-memory
        const user = memUsers[userEmail];
        if (user && user.subscription) {
          return sendJSON(res, 200, user.subscription);
        }
      }

      console.log(`⚠️ User not found for subscription check`);
      return sendJSON(res, 200, { subscriptionStatus: 'free', planType: 'free' });
    }

    // ── QR Codes: Get all from MongoDB ──────────────────────────────────────
    if (method === 'GET' && pathname === '/api/qrcodes/all') {
      try {
        if (db) {
          const qrCodesList = await db.collection('qrcodes').find({}).toArray();
          return sendJSON(res, 200, {
            qrCodes: qrCodesList.map(qr => ({
              id: qr.id,
              destination: qr.destination,
              scan_count: qr.scan_count || 0,
              name: qr.name || qr.id,
              createdAt: qr.createdAt || null
            }))
          });
        } else {
          // Fallback to in-memory
          const qrCodesList = Object.values(qrCodes).map(qr => ({
            id: qr.id,
            destination: qr.destination,
            scan_count: qr.scan_count || 0,
            name: qr.name || qr.id,
            createdAt: qr.createdAt || null
          }));
          return sendJSON(res, 200, { qrCodes: qrCodesList });
        }
      } catch (error) {
        console.error('Error fetching all QR codes:', error.message);
        return sendJSON(res, 500, { error: error.message });
      }
    }

    // ── QR Codes: Save standalone (called by Worker) ─────────────────────────
    if (method === 'POST' && (pathname === '/api/qrcodes' || pathname === '/qrcodes')) {
      const body = await parseBody(req);
      const { id, data, destination, qrCodeData, type } = body;

      // Accept 'data', 'destination', or 'qrCodeData' field
      const targetDestination = data || destination || qrCodeData || '';
      const qrType = type || detectQrType(targetDestination);

      if (!id) {
        console.error(`❌ Invalid request: id=${id}, destination=${targetDestination}`);
        return sendJSON(res, 400, { error: 'Missing QR code ID or destination.' });
      }

      // Get the authenticated user's ID from req.user (set by auth middleware)
      const userId = req.user?.id || req.user?._id || null;

      if (!userId) {
        console.error(`❌ No userId found in request for QR code save: ${id}`);
        return sendJSON(res, 401, { error: 'User not authenticated' });
      }

      console.log(`📝 Saving QR code for user: ${userId}, type: ${qrType}`);

      // Always save to in-memory (for fast redirects)
      qrCodes[id] = {
        ...qrCodes[id],
        id,
        destination: targetDestination,
        qrCodeData: qrCodeData || targetDestination,
        type: qrType,
        userId: userId,
        updatedAt: new Date().toISOString(),
        createdAt: qrCodes[id]?.createdAt || new Date().toISOString(),
        scan_count: qrCodes[id]?.scan_count || 0
      };

      console.log(`✅ QR code saved to memory: ${id} -> ${targetDestination} (type: ${qrType}) for user ${userId}`);

      // Also save to MongoDB with upsert (persistent storage)
      if (db) {
        try {
          const collection = db.collection('qrcodes');
          await collection.updateOne(
            { id: id },
            {
              $set: {
                id: id,
                name: qrCodes[id]?.name || body.name || id,
                destination: targetDestination,
                type: qrType,
                qrImageData: qrCodes[id]?.qrImageData || body.qrImageData || '',
                userId: userId,
                scan_count: qrCodes[id]?.scan_count || 0,
                updatedAt: new Date()
              },
              $setOnInsert: {
                createdAt: new Date()
              }
            },
            { upsert: true }
          );
          console.log(`✅ QR code saved to MongoDB: ${id} -> ${targetDestination} (type: ${qrType}) for user ${userId}`);
        } catch (mongoError) {
          console.error(`❌ MongoDB save error: ${mongoError.message}`);
          // Non-blocking: still return success since in-memory save worked
        }
      }



      return sendJSON(res, 200, { success: true, id });

    }

    // ── QR Codes: Save to user assets ────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/assets/qrcodes') {
      const body = await parseBody(req);
      const { qrCodeId, qrData, qrImageData, design, data, imageData, name, type } = body;
      const finalId = qrCodeId || body.id;
      const finalData = qrData || data || '';
      const finalImageData = qrImageData || imageData || '';
      const finalName = name || finalId || 'Untitled QR Code';
      const qrType = type || detectQrType(finalData);

      // Get the authenticated user's ID from req.user (set by auth middleware)
      const userId = req.user?.id || req.user?._id || null;

      if (!userId) {
        console.error(`❌ No userId found for QR code save to assets: ${finalId}`);
        return sendJSON(res, 401, { error: 'User not authenticated' });
      }

      console.log(`Saving QR code to user assets: ${finalId} (userId: ${userId}, type: ${qrType})`);
      console.log(`🔍 DEBUG SAVE: userId type=${typeof userId}, value=${JSON.stringify(userId)}`);
      console.log(`🔍 DEBUG SAVE: req.user keys=${Object.keys(req.user || {})}`);
      console.log(`🔍 DEBUG SAVE: req.user.id=${req.user?.id}, req.user._id=${req.user?._id}, req.user.email=${req.user?.email}`);

      // Always save to in-memory (for fast redirects)
      qrCodes[finalId] = {
        id: finalId,
        name: finalName,
        destination: finalData,
        type: qrType,
        qrImageData: finalImageData,
        design: design || null,
        userId: userId,
        createdAt: new Date().toISOString(),
        scan_count: 0
      };

      // Also save to MongoDB qrcodes collection with userId (persistent storage)
      if (db) {
        try {
          const collection = db.collection('qrcodes');
          console.log(`🔍 DEBUG SAVE: Using database: ${db.databaseName}, collection: qrcodes`);
          console.log(`🔍 DEBUG SAVE: Upserting with id=${finalId}, userId=${userId}, type=${qrType}`);
          const result = await collection.updateOne(
            { id: finalId },
            {
              $set: {
                id: finalId,
                name: finalName,
                destination: finalData,
                type: qrType,
                qrImageData: finalImageData,
                design: design || null,
                userId: userId,
                scan_count: 0,
                updatedAt: new Date()
              },
              $setOnInsert: {
                createdAt: new Date()
              }
            },
            { upsert: true }
          );

          console.log(`✅ QR code saved to MongoDB qrcodes collection: ${finalId} for user ${userId}`);
          console.log(`🔍 DEBUG SAVE: MongoDB result: upsertedId=${result.upsertedId}, modified=${result.modifiedCount}, upserted=${result.upsertedCount}`);
          
          // Verify by reading back
          const verifyDoc = await collection.findOne({ id: finalId });
          console.log(`🔍 DEBUG SAVE: Verified doc in MongoDB:`, JSON.stringify({
            id: verifyDoc?.id,
            userId: verifyDoc?.userId,
            userIdType: typeof verifyDoc?.userId,
            destination: verifyDoc?.destination?.substring(0, 50),
            type: verifyDoc?.type
          }));
        } catch (mongoError) {
          console.error(`❌ MongoDB save error: ${mongoError.message}`);
          console.error(`🔍 DEBUG SAVE: Full error:`, mongoError);
          // Non-blocking: still return success since in-memory save worked
        }
      } else {
        console.log(`🔍 DEBUG SAVE: db is null/undefined, cannot save to MongoDB`);
      }

      return sendJSON(res, 200, { success: true, id: finalId });

    }



    // ── QR Codes: Get all user QR codes ─────────────────────────────────────
    if (method === 'GET' && pathname === '/api/assets/qrcodes') {
      // Get the authenticated user's ID from req.user (set by auth middleware)
      const userId = req.user?.id || req.user?._id || null;

      let qrCodesList;
      if (userId) {
        // Try MongoDB first for persistent data
        if (db) {
          try {
            qrCodesList = await db.collection('qrcodes').find({ userId: userId }).toArray();
            console.log(`GET /api/assets/qrcodes: Found ${qrCodesList.length} QR codes in MongoDB for userId: ${userId}`);
          } catch (mongoError) {
            console.error('GET /api/assets/qrcodes: MongoDB query error:', mongoError.message);
            qrCodesList = Object.values(qrCodes).filter(q => q.userId === userId || q.userId === req.user?.email);
          }
        } else {
          qrCodesList = Object.values(qrCodes).filter(q => q.userId === userId || q.userId === req.user?.email);
        }
        console.log(`Returning ${qrCodesList.length} QR codes for userId: ${userId}`);
      } else {
        qrCodesList = Object.values(qrCodes);
        console.log(`Returning ${qrCodesList.length} QR codes (no auth filter)`);
      }

      return sendJSON(res, 200, { qrCodes: qrCodesList });
    }



    // ── QR Codes: Delete from assets ─────────────────────────────────────────
    const deleteAssetsQrMatch = matchPath('/api/assets/qrcodes/:id', pathname);
    if (method === 'DELETE' && deleteAssetsQrMatch) {
      const { id } = deleteAssetsQrMatch;
      console.log(`Deleting QR code: ${id}`);

      // Delete from in-memory
      if (qrCodes[id]) {
        delete qrCodes[id];
      }

      // Also delete from MongoDB
      if (db) {
        try {
          const collection = db.collection('qrcodes');
          const result = await collection.deleteOne({ id: id });
          console.log(`✅ QR code deleted from MongoDB: ${id} (deleted: ${result.deletedCount})`);
        } catch (mongoError) {
          console.error(`❌ MongoDB delete error for ${id}: ${mongoError.message}`);
        }
      }

      // Also delete from Cloudflare KV (fire-and-forget, don't block response)
      const workerUrl = process.env.WORKER_URL;
      if (workerUrl) {
        fetch(`${workerUrl}/api/kv/delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: id }),
        }).then(kvResponse => {
          if (kvResponse.ok) {
            console.log(`✅ KV cache deleted for ${id}`);
          } else {
            return kvResponse.text().then(kvText => {
              console.error(`❌ KV delete failed for ${id}: ${kvResponse.status} - ${kvText}`);
            });
          }
        }).catch(kvErr => {
          console.error(`❌ KV delete error for ${id}:`, kvErr.message);
        });
      }

      return sendJSON(res, 200, { success: true, id });

    }


    // ── QR Codes: Delete standalone ──────────────────────────────────────────
    const deleteQrMatch = matchPath('/qrcodes/:id', pathname);
    if (method === 'DELETE' && deleteQrMatch) {
      const { id } = deleteQrMatch;
      console.log(`Deleting QR code from standalone: ${id}`);

      if (!qrCodes[id]) {
        return sendJSON(res, 404, { error: 'QR code not found' });
      }

      delete qrCodes[id];
      return sendJSON(res, 200, { success: true, id });
    }

    // ── QR Codes: Get destination ────────────────────────────────────────────
    const getQrMatch = matchPath('/api/qrcodes/:id', pathname);
    if (method === 'GET' && getQrMatch) {
      const { id } = getQrMatch;
      const qrCode = qrCodes[id];

      if (!qrCode) {
        return sendJSON(res, 404, { error: 'Not found' });
      }

      return sendJSON(res, 200, { destination: qrCode.destination || qrCode.qrCodeData });
    }

    // ── QR Codes: Update metadata (PUT) ─────────────────────────────────────
    const updateQrMatch = matchPath('/api/qrcodes/:id', pathname);
    if (method === 'PUT' && updateQrMatch) {
      const { id } = updateQrMatch;
      const body = await parseBody(req);

      if (!qrCodes[id]) {
        return sendJSON(res, 404, { error: 'QR code not found' });
      }

      // Update ONLY metadata fields - preserve design/appearance
      const updates = {};
      if (body.destination !== undefined) updates.destination = body.destination;
      if (body.name !== undefined) updates.name = body.name;
      if (body.category !== undefined) updates.category = body.category;
      if (body.tags !== undefined) updates.tags = body.tags;
      if (body.notes !== undefined) updates.notes = body.notes;
      updates.updatedAt = new Date().toISOString();

      // Merge updates into existing QR code (preserve design, qrImageData, etc.)
      qrCodes[id] = {
        ...qrCodes[id],
        ...updates,
        // Explicitly preserve these fields
        qrImageData: qrCodes[id].qrImageData,
        design: qrCodes[id].design,
        qrCodeData: qrCodes[id].qrCodeData,
        scan_count: qrCodes[id].scan_count,
        createdAt: qrCodes[id].createdAt,
      };

      console.log(`✅ QR code metadata updated: ${id}`, updates);

      // ── STEP 1: Update MongoDB ──────────────────────────────────────────────
      if (db && updates.destination) {
        try {
          const collection = db.collection('qrcodes');
          await collection.updateOne(
            { id: id },
            { $set: { destination: updates.destination, updatedAt: new Date() } }
          );
          console.log(`✅ MongoDB updated for ${id} -> ${updates.destination}`);
        } catch (mongoError) {
          console.error(`❌ MongoDB update error for ${id}: ${mongoError.message}`);
        }
      }

      // ── STEP 2: CRITICAL - Update KV cache immediately (synchronous) ────────
      // The Worker checks KV first for redirects, so we must keep KV in sync.
      // This must complete before we respond to ensure scans redirect correctly.
      if (updates.destination) {
        const workerUrl = process.env.WORKER_URL || 'https://stiqr.supreme-ai-facts.workers.dev';
        const baseUrl = workerUrl.replace(/\/+$/, '');
        const kvUrl = baseUrl.includes('/api/kv/update') ? baseUrl : `${baseUrl}/api/kv/update`;
        
        console.log(`🔄 Updating KV cache synchronously: POST ${kvUrl}`);
        try {
          const kvResponse = await fetch(kvUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: id, value: updates.destination }),
          });
          
          if (kvResponse.ok) {
            console.log(`✅ KV cache updated for ${id} -> ${updates.destination}`);
          } else {
            const kvText = await kvResponse.text();
            console.error(`❌ KV update failed for ${id}: ${kvResponse.status} - ${kvText}`);
          }
        } catch (kvErr) {
          console.error(`❌ KV update error for ${id}:`, kvErr.message);
        }
      }

      return sendJSON(res, 200, { success: true, id, updates });
    }


    // ── QR Codes: Increment scan count ───────────────────────────────────────
    const incrementMatch = matchPath('/api/qrcodes/:id/increment', pathname);
    if (method === 'POST' && incrementMatch) {
      const { id } = incrementMatch;

      if (qrCodes[id]) {
        qrCodes[id].scan_count = (qrCodes[id].scan_count || 0) + 1;
      }

      return sendJSON(res, 200, { success: true });
    }

    // ── Track: Redirect ──────────────────────────────────────────────────────
    const trackMatch = matchPath('/track/:id', pathname);
    if (method === 'GET' && trackMatch) {
      const { id } = trackMatch;
      console.log(`Tracking request for QR code: ${id}`);

      // Try to find QR code in in-memory first, then MongoDB
      let qrCode = qrCodes[id];
      
      if (!qrCode && db) {
        try {
          const mongoQr = await db.collection('qrcodes').findOne({ id: id });
          if (mongoQr) {
            // Load into in-memory for fast subsequent access
            qrCodes[id] = mongoQr;
            qrCode = qrCodes[id];
            console.log(`✅ QR code loaded from MongoDB for tracking: ${id}`);
          }
        } catch (err) {
          console.error(`❌ Failed to load QR code from MongoDB for tracking: ${err.message}`);
        }
      }

      if (!qrCode) {
        console.log(`QR code not found: ${id}`);
        return sendRedirect(res, 'https://www.youtube.com');
      }

      // Increment scan count in-memory
      qrCode.scan_count = (qrCode.scan_count || 0) + 1;

      // Also persist scan count to MongoDB (fire-and-forget, don't block redirect)
      if (db) {
        db.collection('qrcodes').updateOne(
          { id: id },
          { $inc: { scan_count: 1 } }
        ).then(() => {
          console.log(`✅ Scan count persisted to MongoDB for ${id}: ${qrCode.scan_count}`);
        }).catch(err => {
          console.error(`❌ Failed to persist scan count to MongoDB for ${id}: ${err.message}`);
        });
      }

      const destination = qrCode.destination || qrCode.qrCodeData;
      const qrType = qrCode.type || 'url';
      
      console.log(`QR code type: ${qrType}, destination: ${destination?.substring(0, 100)}`);
      
      if (qrType === 'wifi') {
        // For WiFi QR codes, return the raw WiFi config as text/plain
        // The phone's OS will automatically detect and handle the WiFi config
        console.log(`Serving WiFi config as text/plain`);
        res.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        });
        return res.end(destination);
      }
      
      if (qrType === 'pdf') {
        // For PDF QR codes, redirect to the PDF URL
        console.log(`Redirecting to PDF: ${destination}`);
        return sendRedirect(res, destination);
      }
      
      // For all other types (url, email, sms, whatsapp), redirect as before
      console.log(`Redirecting to: ${destination}`);
      return sendRedirect(res, destination);
    }


    // ── Assets: Get all assets ───────────────────────────────────────────────
    if (method === 'GET' && pathname === '/api/assets') {
      // Get the authenticated user's ID from req.user (set by auth middleware)
      const userId = req.user?.id || req.user?._id || null;

      console.log(`🔍 DEBUG FETCH: /api/assets called`);
      console.log(`🔍 DEBUG FETCH: req.user =`, JSON.stringify(req.user));
      console.log(`🔍 DEBUG FETCH: userId = ${userId}, type = ${typeof userId}`);

      if (!userId) {
        console.log('GET /api/assets: No authenticated user, returning empty');
        return sendJSON(res, 200, { stickers: [], logos: [], qrCodes: [] });
      }

      // Fetch QR codes from MongoDB qrcodes collection filtered by userId
      let qrCodesList = [];
      if (db) {
        try {
          console.log(`🔍 DEBUG FETCH: Using database: ${db.databaseName}`);
          
          // First, check what collections exist
          const collections = await db.listCollections().toArray();
          console.log(`🔍 DEBUG FETCH: Available collections: ${collections.map(c => c.name).join(', ')}`);
          
          // Check if qrcodes collection exists and has any documents
          const totalCount = await db.collection('qrcodes').countDocuments();
          console.log(`🔍 DEBUG FETCH: Total documents in qrcodes collection: ${totalCount}`);
          
          // Sample a few documents to see their structure
          const sampleDocs = await db.collection('qrcodes').find({}).limit(3).toArray();
          console.log(`🔍 DEBUG FETCH: Sample documents:`, JSON.stringify(sampleDocs.map(d => ({
            id: d.id,
            userId: d.userId,
            userIdType: typeof d.userId,
            destination: d.destination?.substring(0, 50)
          }))));
          
          // Now query with the userId
          qrCodesList = await db.collection('qrcodes').find({ userId: userId }).toArray();
          console.log(`🔍 DEBUG FETCH: Found ${qrCodesList.length} QR codes in MongoDB for userId: ${userId}`);
          
          // Also try querying with different userId formats
          if (qrCodesList.length === 0) {
            // Try string comparison
            const allDocs = await db.collection('qrcodes').find({}).toArray();
            console.log(`🔍 DEBUG FETCH: All documents userIds:`, allDocs.map(d => `"${d.userId}" (${typeof d.userId})`));
            console.log(`🔍 DEBUG FETCH: Looking for userId: "${userId}" (${typeof userId})`);
            
            // Try to find any matching by loose comparison
            const matchingDocs = allDocs.filter(d => String(d.userId) === String(userId));
            console.log(`🔍 DEBUG FETCH: Documents matching by string comparison: ${matchingDocs.length}`);
          }
        } catch (mongoError) {
          console.error('GET /api/assets: MongoDB query error:', mongoError.message);
          console.error('🔍 DEBUG FETCH: Full error:', mongoError);
        }
      } else {
        console.log(`🔍 DEBUG FETCH: db is null/undefined`);
        // Fallback to in-memory filter
        qrCodesList = Object.values(qrCodes).filter(q => q.userId === userId || q.userId === req.user?.email);
      }

      // Fetch stickers from MongoDB (with in-memory fallback)
      let stickersList = [];
      if (db) {
        try {
          stickersList = await db.collection('stickers').find({ userId: userId }).toArray();
          console.log(`GET /api/assets: Found ${stickersList.length} stickers in MongoDB for userId: ${userId}`);
        } catch (mongoError) {
          console.error('GET /api/assets: MongoDB stickers query error:', mongoError.message);
          stickersList = Object.values(stickers).filter(s => s.userId === userId || s.userId === req.user?.email);
        }
      } else {
        stickersList = Object.values(stickers).filter(s => s.userId === userId || s.userId === req.user?.email);
      }

      // Fetch logos from MongoDB (with in-memory fallback)
      let logosList = [];
      if (db) {
        try {
          logosList = await db.collection('logos').find({ userId: userId }).toArray();
          console.log(`GET /api/assets: Found ${logosList.length} logos in MongoDB for userId: ${userId}`);
        } catch (mongoError) {
          console.error('GET /api/assets: MongoDB logos query error:', mongoError.message);
          logosList = Object.values(logos).filter(l => l.userId === userId || l.userId === req.user?.email);
        }
      } else {
        logosList = Object.values(logos).filter(l => l.userId === userId || l.userId === req.user?.email);
      }

      console.log(`GET /api/assets: returning ${stickersList.length} stickers, ${logosList.length} logos, ${qrCodesList.length} QR codes`);
      return sendJSON(res, 200, { stickers: stickersList, logos: logosList, qrCodes: qrCodesList });

    }




    // ── Stickers: Save ───────────────────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/assets/stickers') {
      const body = await parseBody(req);
      const { data, name, category, qrCodeId } = body;
      const id = String(stickerIdCounter++);

      // Get the authenticated user's ID from req.user (set by auth middleware)
      const userId = req.user?.id || req.user?._id || null;

      if (!userId) {
        return sendJSON(res, 401, { error: 'User not authenticated' });
      }

      // Always save to in-memory
      stickers[id] = {
        id,
        data: data || '',
        name: name || 'Untitled Sticker',
        category: category || 'custom',
        qrCodeId: qrCodeId || null,
        userId: userId,
        createdAt: new Date().toISOString()
      };

      // Also save to MongoDB
      if (db) {
        try {
          const collection = db.collection('stickers');
          const result = await collection.insertOne({
            id: id,
            userId: userId,
            qrCodeId: qrCodeId || null,
            name: name || 'Untitled Sticker',
            category: category || 'custom',
            data: data || '',
            createdAt: new Date()
          });
          console.log(`✅ Sticker saved to MongoDB: ${id} (name: ${stickers[id].name})`);
        } catch (mongoError) {
          console.error(`❌ MongoDB sticker save error: ${mongoError.message}`);
        }
      }

      console.log(`Sticker saved: ${stickers[id].name} (ID: ${id}, userId: ${userId || 'none'})`);
      return sendJSON(res, 200, { success: true, sticker: stickers[id] });
    }


    // ── Stickers: Delete ─────────────────────────────────────────────────────
    const deleteStickerMatch = matchPath('/api/assets/stickers/:id', pathname);
    if (method === 'DELETE' && deleteStickerMatch) {
      const { id } = deleteStickerMatch;

      if (!stickers[id]) {
        return sendJSON(res, 404, { error: 'Sticker not found' });
      }

      // Get the authenticated user's ID from req.user (set by auth middleware)
      const userId = req.user?.id || req.user?._id || null;

      // Security: only allow deletion if user owns the sticker or is admin
      if (userId && stickers[id].userId && stickers[id].userId !== userId && stickers[id].userId !== req.user?.email) {
        console.warn(`⚠️ Unauthorized delete attempt for sticker ${id} by userId ${userId}`);
        return sendJSON(res, 403, { error: 'Not authorized to delete this sticker' });
      }

      // Also delete from MongoDB
      if (db) {
        try {
          const collection = db.collection('stickers');
          await collection.deleteOne({ id: id, userId: userId });
          console.log(`✅ Sticker deleted from MongoDB: ${id}`);
        } catch (mongoError) {
          console.error(`❌ MongoDB sticker delete error: ${mongoError.message}`);
        }
      }

      delete stickers[id];
      console.log(`Sticker deleted: ${id}`);
      return sendJSON(res, 200, { success: true, id });
    }


    // ── Logos: Save ──────────────────────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/assets/logos') {
      const body = await parseBody(req);
      const { data, name, qrCodeId } = body;
      const id = String(logoIdCounter++);

      // Get the authenticated user's ID from req.user (set by auth middleware)
      const userId = req.user?.id || req.user?._id || null;

      if (!userId) {
        return sendJSON(res, 401, { error: 'User not authenticated' });
      }

      // Always save to in-memory
      logos[id] = {
        id,
        data: data || '',
        name: name || 'Untitled Logo',
        qrCodeId: qrCodeId || null,
        userId: userId,
        createdAt: new Date().toISOString()
      };

      // Also save to MongoDB
      if (db) {
        try {
          const collection = db.collection('logos');
          const result = await collection.insertOne({
            id: id,
            userId: userId,
            qrCodeId: qrCodeId || null,
            name: name || 'Untitled Logo',
            data: data || '',
            createdAt: new Date()
          });
          console.log(`✅ Logo saved to MongoDB: ${id} (name: ${logos[id].name})`);
        } catch (mongoError) {
          console.error(`❌ MongoDB logo save error: ${mongoError.message}`);
        }
      }

      console.log(`Logo saved: ${logos[id].name} (ID: ${id}, userId: ${userId || 'none'})`);
      return sendJSON(res, 200, { success: true, logo: logos[id] });
    }


    // ── Logos: Delete ────────────────────────────────────────────────────────
    const deleteLogoMatch = matchPath('/api/assets/logos/:id', pathname);
    if (method === 'DELETE' && deleteLogoMatch) {
      const { id } = deleteLogoMatch;

      if (!logos[id]) {
        return sendJSON(res, 404, { error: 'Logo not found' });
      }

      // Get the authenticated user's ID from req.user (set by auth middleware)
      const userId = req.user?.id || req.user?._id || null;

      // Security: only allow deletion if user owns the logo or is admin
      if (userId && logos[id].userId && logos[id].userId !== userId && logos[id].userId !== req.user?.email) {
        console.warn(`⚠️ Unauthorized delete attempt for logo ${id} by userId ${userId}`);
        return sendJSON(res, 403, { error: 'Not authorized to delete this logo' });
      }

      // Also delete from MongoDB
      if (db) {
        try {
          const collection = db.collection('logos');
          await collection.deleteOne({ id: id, userId: userId });
          console.log(`✅ Logo deleted from MongoDB: ${id}`);
        } catch (mongoError) {
          console.error(`❌ MongoDB logo delete error: ${mongoError.message}`);
        }
      }

      delete logos[id];
      console.log(`Logo deleted: ${id}`);
      return sendJSON(res, 200, { success: true, id });
    }



    // ── Scan: Log analytics ──────────────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/scan/log') {
      const body = await parseBody(req);
      
      // Always save to in-memory
      const scanRecord = {
        ...body,
        processedAt: new Date().toISOString()
      };
      scans.push(scanRecord);

      // Also save to MongoDB scans collection (persistent storage)
      if (db) {
        try {
          const collection = db.collection('scans');
          await collection.insertOne({
            qrCodeId: body.qrCodeId,
            timestamp: body.timestamp || new Date().toISOString(),
            country: body.country || null,
            countryCode: body.countryCode || null,
            city: body.city || null,
            region: body.region || null,
            deviceType: body.deviceType || null,
            os: body.os || null,
            browser: body.browser || null,
            userAgent: body.userAgent || null,
            referer: body.referer || null,
            ip: body.ip || null,
            processedAt: new Date()
          });
          console.log(`✅ Scan saved to MongoDB: ${body.qrCodeId} from ${body.country || 'unknown'}`);
          
          // Also increment scan_count in qrcodes collection
          await db.collection('qrcodes').updateOne(
            { id: body.qrCodeId },
            { $inc: { scan_count: 1 } }
          );
          console.log(`✅ Scan count incremented in MongoDB for ${body.qrCodeId}`);
        } catch (mongoError) {
          console.error(`❌ MongoDB scan save error: ${mongoError.message}`);
          // Non-blocking: still return success since in-memory save worked
        }
      }

      console.log(`📊 Scan logged: ${body.qrCodeId} from ${body.country || 'unknown'}`);
      return sendJSON(res, 200, { success: true });
    }

    // ── Analytics: Get all ───────────────────────────────────────────────────
    const analyticsMatch = matchPath('/api/analytics/:qrCodeId', pathname);
    if (method === 'GET' && analyticsMatch && !pathname.endsWith('/timeline') && !pathname.endsWith('/summary')) {
      const { qrCodeId } = analyticsMatch;
      
      // Try to get scans from MongoDB first, fallback to in-memory
      let qrScans = [];
      if (db) {
        try {
          const mongoScans = await db.collection('scans').find({ qrCodeId: qrCodeId }).toArray();
          qrScans = mongoScans.map(s => ({
            ...s,
            timestamp: s.timestamp || s.processedAt?.toISOString() || new Date().toISOString(),
            processedAt: s.processedAt?.toISOString() || new Date().toISOString()
          }));
          console.log(`📊 Analytics: Found ${qrScans.length} scans in MongoDB for ${qrCodeId}`);
        } catch (mongoError) {
          console.error(`❌ MongoDB analytics query error: ${mongoError.message}`);
          qrScans = scans.filter(s => s.qrCodeId === qrCodeId);
        }
      } else {
        qrScans = scans.filter(s => s.qrCodeId === qrCodeId);
      }

      const summary = {
        totalScans: qrScans.length,
        uniqueCountries: [...new Set(qrScans.map(s => s.country).filter(Boolean))],
        devices: {
          mobile: qrScans.filter(s => s.deviceType === 'mobile').length,
          desktop: qrScans.filter(s => s.deviceType === 'desktop').length,
          tablet: qrScans.filter(s => s.deviceType === 'tablet').length
        },
        browsers: {},
        os: {},
        scansByHour: {},
        recentScans: qrScans.slice(-10).reverse()
      };

      qrScans.forEach(scan => {
        if (scan.browser) summary.browsers[scan.browser] = (summary.browsers[scan.browser] || 0) + 1;
        if (scan.os) summary.os[scan.os] = (summary.os[scan.os] || 0) + 1;
      });

      return sendJSON(res, 200, { summary, scans: qrScans });
    }

    // ── Analytics: Timeline ──────────────────────────────────────────────────
    const timelineMatch = matchPath('/api/analytics/:qrCodeId/timeline', pathname);
    if (method === 'GET' && timelineMatch) {
      const { qrCodeId } = timelineMatch;
      
      // Try to get scans from MongoDB first, fallback to in-memory
      let qrScans = [];
      if (db) {
        try {
          const mongoScans = await db.collection('scans').find({ qrCodeId: qrCodeId }).toArray();
          qrScans = mongoScans.map(s => ({
            ...s,
            timestamp: s.timestamp || s.processedAt?.toISOString() || new Date().toISOString()
          }));
        } catch (mongoError) {
          console.error(`❌ MongoDB timeline query error: ${mongoError.message}`);
          qrScans = scans.filter(s => s.qrCodeId === qrCodeId);
        }
      } else {
        qrScans = scans.filter(s => s.qrCodeId === qrCodeId);
      }

      const timeline = {};
      qrScans.forEach(scan => {
        const date = new Date(scan.timestamp).toISOString().split('T')[0];
        timeline[date] = (timeline[date] || 0) + 1;
      });

      return sendJSON(res, 200, { timeline });
    }

    // ── Analytics: Summary ───────────────────────────────────────────────────
    const summaryMatch = matchPath('/api/analytics/:qrCodeId/summary', pathname);
    if (method === 'GET' && summaryMatch) {
      const { qrCodeId } = summaryMatch;
      
      // Try to get scans from MongoDB first, fallback to in-memory
      let qrScans = [];
      if (db) {
        try {
          const mongoScans = await db.collection('scans').find({ qrCodeId: qrCodeId }).toArray();
          qrScans = mongoScans.map(s => ({
            ...s,
            timestamp: s.timestamp || s.processedAt?.toISOString() || new Date().toISOString()
          }));
        } catch (mongoError) {
          console.error(`❌ MongoDB summary query error: ${mongoError.message}`);
          qrScans = scans.filter(s => s.qrCodeId === qrCodeId);
        }
      } else {
        qrScans = scans.filter(s => s.qrCodeId === qrCodeId);
      }

      const summary = {
        totalScans: qrScans.length,
        byDevice: {},
        byCountry: {},
        byDate: {},
        recentScans: qrScans.slice(-20).reverse()
      };

      qrScans.forEach(scan => {
        const device = scan.deviceType || 'unknown';
        summary.byDevice[device] = (summary.byDevice[device] || 0) + 1;

        const country = scan.country || 'unknown';
        summary.byCountry[country] = (summary.byCountry[country] || 0) + 1;

        const date = new Date(scan.timestamp).toISOString().split('T')[0];
        summary.byDate[date] = (summary.byDate[date] || 0) + 1;
      });

      return sendJSON(res, 200, summary);
    }

    // ── PDF Upload ──────────────────────────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/upload/pdf') {
      const body = await parseBody(req);
      const { fileData, fileName } = body;

      if (!fileData) {
        return sendJSON(res, 400, { error: 'Missing fileData (base64 encoded PDF)' });
      }

      // Get the authenticated user's ID from req.user (set by auth middleware)
      const userId = req.user?.id || req.user?._id || null;

      if (!userId) {
        return sendJSON(res, 401, { error: 'User not authenticated' });
      }

      // Decode base64 data (strip data:application/pdf;base64, prefix if present)
      let base64Data = fileData;
      if (base64Data.includes(';base64,')) {
        base64Data = base64Data.split(';base64,')[1];
      }

      const buffer = Buffer.from(base64Data, 'base64');
      
      // Generate a unique filename
      const safeName = (fileName || 'document.pdf')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_{2,}/g, '_');
      const uniqueName = `${Date.now()}-${userId}-${safeName}`;
      const uploadsDir = path.join(__dirname, 'uploads');
      
      // Ensure uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, uniqueName);
      fs.writeFileSync(filePath, buffer);

      // Determine the public URL
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
      const publicUrl = `${protocol}://${host}/uploads/${uniqueName}`;

      console.log(`✅ PDF uploaded: ${publicUrl} (${buffer.length} bytes) by user ${userId}`);

      return sendJSON(res, 200, {
        success: true,
        url: publicUrl,
        fileName: uniqueName,
        size: buffer.length
      });
    }

    // ── Serve Uploaded Files (Static) ─────────────────────────────────────────────
    const uploadsMatch = pathname.startsWith('/uploads/');
    if (method === 'GET' && uploadsMatch) {
      const relativePath = pathname.replace('/uploads/', '');
      const filePath = path.join(__dirname, 'uploads', relativePath);

      // Security: prevent directory traversal
      if (!filePath.startsWith(path.join(__dirname, 'uploads'))) {
        return sendJSON(res, 403, { error: 'Forbidden' });
      }

      if (!fs.existsSync(filePath)) {
        return sendJSON(res, 404, { error: 'File not found' });
      }

      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      const content = fs.readFileSync(filePath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': content.length,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000',
      });
      return res.end(content);
    }

    // ── Social Pages: Save configuration ─────────────────────────────────────
    if (method === 'POST' && pathname === '/api/social-pages') {
      const body = await parseBody(req);
      const { id, buttons, title, pageColor, headline } = body;
      const userId = req.user?.id || req.user?._id || null;

      if (!id || !buttons) {
        return sendJSON(res, 400, { error: 'Missing id or buttons' });
      }

      const socialPage = {
        id: id,
        userId: userId,
        title: title || 'My Social Links',
        headline: headline || 'Follow me on these Social Media',
        pageColor: pageColor || '#e5e9ec',
        buttons: buttons,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to in-memory
      const socialPages = globalThis._socialPages || {};
      socialPages[id] = socialPage;
      globalThis._socialPages = socialPages;

      // Also save to MongoDB
      if (db) {
        try {
          const collection = db.collection('social_pages');
          await collection.updateOne(
            { id: id },
            { $set: socialPage },
            { upsert: true }
          );
          console.log(`✅ Social page saved to MongoDB: ${id}`);
        } catch (mongoError) {
          console.error(`❌ MongoDB social page save error: ${mongoError.message}`);
        }
      }

      console.log(`✅ Social page saved: ${id} with ${buttons.length} buttons`);
      return sendJSON(res, 200, { success: true, id });
    }

    // ── Social Pages: Get configuration ──────────────────────────────────────
    const getSocialPageMatch = matchPath('/api/social-pages/:id', pathname);
    if (method === 'GET' && getSocialPageMatch) {
      const { id } = getSocialPageMatch;
      
      // Try in-memory first
      const socialPages = globalThis._socialPages || {};
      let page = socialPages[id];

      // Fallback to MongoDB
      if (!page && db) {
        try {
          page = await db.collection('social_pages').findOne({ id: id });
        } catch (mongoError) {
          console.error(`❌ MongoDB social page fetch error: ${mongoError.message}`);
        }
      }

      if (!page) {
        return sendJSON(res, 404, { error: 'Social page not found' });
      }

      return sendJSON(res, 200, page);
    }

    // ── Social Pages: Public landing page ────────────────────────────────────
    const socialLandingMatch = matchPath('/social/:id', pathname);
    if (method === 'GET' && socialLandingMatch) {
      const { id } = socialLandingMatch;
      console.log(`📱 Serving social landing page: ${id}`);

      try {
        // Try in-memory first
        const socialPages = globalThis._socialPages || {};
        let page = socialPages[id];

        // Fallback to MongoDB
        if (!page && db) {
          try {
            page = await db.collection('social_pages').findOne({ id: id });
            if (page) {
              // Cache in memory for fast subsequent access
              socialPages[id] = page;
              globalThis._socialPages = socialPages;
            }
          } catch (mongoError) {
            console.error(`❌ MongoDB social page fetch error: ${mongoError.message}`);
          }
        }

        if (!page) {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          return res.end('<h1>Page not found</h1>');
        }

        // Determine platform-specific color
        function getPlatformColor(platform) {
          const colors = {
            'instagram': '#E4405F',
            'youtube': '#FF0000',
            'tiktok': '#000000',
            'facebook': '#1877F2',
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
            'generic': '#555'
          };
          return colors[platform?.toLowerCase()] || '#555';
        }

        // Generate HTML with buttons
        const buttonsHtml = page.buttons.map(btn => {
          const buttonColor = getPlatformColor(btn.platform);
          // Use label if available, otherwise use platform name, fallback to 'Visit'
          const label = btn.label || btn.platform || 'Visit';
          // Use the exact URL the user provided - only escape HTML special chars in the URL
          const url = (btn.url || '#').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          const platform = (btn.platform || '').toLowerCase();
          // For TikTok, add a border to make it visible on black
          const borderStyle = platform === 'tiktok' ? 'border: 2px solid #00f2ea;' : '';
          
          return `
            <a href="${url}" target="_blank" rel="noopener noreferrer" class="social-button" style="background: ${buttonColor}; ${borderStyle}">
              <span class="btn-label">${label}</span>
              <span class="btn-arrow">→</span>
            </a>
          `;
        }).join('');

        const safeTitle = page.title || 'My Social Links';
        const safeHeadline = page.headline || 'Connect with me';
        const bgColor = page.pageColor || '#0a0a2e';

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${safeTitle}</title>
  <meta name="description" content="Connect with me on social media">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(135deg, #0a0a2e 0%, #1a0a2e 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      width: 100%;
      background: rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 40px 24px;
      backdrop-filter: blur(10px);
      text-align: center;
    }
    h1 {
      color: white;
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 30px;
      word-break: break-word;
      line-height: 1.3;
    }
    .social-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 12px auto;
      padding: 14px 20px;
      width: 100%;
      max-width: 320px;
      text-decoration: none;
      color: white;
      font-weight: 600;
      font-size: 15px;
      border-radius: 50px;
      transition: transform 0.2s ease, opacity 0.2s ease;
      text-align: center;
    }
    .social-button:hover {
      transform: scale(1.03);
      opacity: 0.9;
    }
    .social-button:active {
      transform: scale(0.98);
    }
    .btn-label {
      flex: 1;
      text-align: left;
    }
    .btn-arrow {
      font-size: 18px;
      opacity: 0.8;
    }
    .footer {
      margin-top: 30px;
      color: rgba(255,255,255,0.4);
      font-size: 12px;
    }
    @media (max-width: 480px) {
      body { padding: 16px; }
      .container { padding: 30px 16px; }
      h1 { font-size: 20px; }
      .social-button { padding: 12px 16px; font-size: 14px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${safeHeadline}</h1>
    ${buttonsHtml}
    <div class="footer">Powered by StiQR</div>
  </div>
</body>
</html>`;

        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        });
        return res.end(html);
      } catch (error) {
        console.error('❌ Social page error:', error);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end('<h1>Internal server error</h1>');
      }
    }

    // ── 404 ──────────────────────────────────────────────────────────────────
    sendJSON(res, 404, { error: 'Not found' });

  } catch (error) {
    console.error('Error:', error);
    sendJSON(res, 500, { error: error.message || 'Internal server error' });
  }
}

// ─── Start Server ─────────────────────────────────────────────────────────────

async function startServer() {
  await connectToMongoDB();

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`📁 Created uploads directory: ${uploadsDir}`);
  }

  const server = http.createServer(handleRequest);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`   (MongoDB + Stripe webhook + subscription handling enabled)`);
    console.log(`   Uploads directory: ${uploadsDir}`);
  });
}

startServer();
