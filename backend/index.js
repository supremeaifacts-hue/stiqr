const http = require('http');
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

      return sendJSON(res, 200, {
        success: true,
        user: {
          id: user._id ? user._id.toString() : null,
          email: user.email,
          name: user.name || user.email.split('@')[0]
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

      // Get user from JWT token
      const decoded = getUserFromAuthHeader(req);
      let userId = decoded?.id || decoded?.userId || null;
      let userEmail = decoded?.email || null;

      // Fallback to x-user-email header
      if (!userEmail) {
        userEmail = req.headers['x-user-email'] || null;
      }

      console.log(`📊 Subscription check: userId=${userId}, email=${userEmail}, decoded=${JSON.stringify(decoded)}`);

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
          return sendJSON(res, 200, {
            subscriptionStatus: user.subscriptionStatus || 'free',
            planType: user.planType || 'free',
            subscriptionEndDate: user.subscriptionEndDate || null,
            updatedAt: user.updatedAt || null
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
              destination: qr.destination
            }))
          });
        } else {
          // Fallback to in-memory
          const qrCodesList = Object.values(qrCodes).map(qr => ({
            id: qr.id,
            destination: qr.destination
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
      const { id, data, destination, qrCodeData } = body;

      // Accept 'data', 'destination', or 'qrCodeData' field
      const targetDestination = data || destination || qrCodeData || '';

      if (!id) {
        console.error(`❌ Invalid request: id=${id}, destination=${targetDestination}`);
        return sendJSON(res, 400, { error: 'Missing QR code ID or destination.' });
      }

      // Get the authenticated user's ID from the JWT token
      const decoded = getUserFromAuthHeader(req);
      const userId = decoded?.id || decoded?._id || null;

      if (!userId) {
        console.warn(`⚠️ No authenticated user for QR code save: ${id}`);
        // Still save but without userId
      }

      // Always save to in-memory (for fast redirects)
      qrCodes[id] = {
        ...qrCodes[id],
        id,
        destination: targetDestination,
        qrCodeData: qrCodeData || targetDestination,
        userId: userId || qrCodes[id]?.userId || null,
        updatedAt: new Date().toISOString(),
        createdAt: qrCodes[id]?.createdAt || new Date().toISOString(),
        scan_count: qrCodes[id]?.scan_count || 0
      };

      console.log(`✅ QR code saved to memory: ${id} -> ${targetDestination} (userId: ${userId || 'none'})`);

      // Also save to MongoDB with upsert (persistent storage)
      if (db) {
        try {
          const collection = db.collection('qrcodes');
          const updateDoc = {
            $set: {
              id: id,
              destination: targetDestination,
              userId: userId,
              updatedAt: new Date()
            },
            $setOnInsert: {
              createdAt: new Date()
            }
          };
          // Only include userId in $set if we have one
          if (!userId) {
            delete updateDoc.$set.userId;
          }
          await collection.updateOne(
            { id: id },
            updateDoc,
            { upsert: true }
          );
          console.log(`✅ QR code saved to MongoDB: ${id} -> ${targetDestination} (userId: ${userId || 'none'})`);
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
      const { qrCodeId, qrData, qrImageData, design, data, imageData, name } = body;
      const finalId = qrCodeId || body.id;
      const finalData = qrData || data || '';
      const finalImageData = qrImageData || imageData || '';
      const finalName = name || finalId || 'Untitled QR Code';

      // Get the authenticated user's ID from the JWT token
      const decoded = getUserFromAuthHeader(req);
      const userId = decoded?.id || decoded?._id || null;

      console.log(`Saving QR code to user assets: ${finalId} (userId: ${userId || 'none'})`);

      qrCodes[finalId] = {
        id: finalId,
        name: finalName,
        destination: finalData,
        qrImageData: finalImageData,
        design: design || null,
        userId: userId || 'anonymous',
        createdAt: new Date().toISOString(),
        scan_count: 0
      };

      return sendJSON(res, 200, { success: true, id: finalId });
    }

    // ── QR Codes: Get all user QR codes ─────────────────────────────────────
    if (method === 'GET' && pathname === '/api/assets/qrcodes') {
      // Get the authenticated user's ID from the JWT token
      const decoded = getUserFromAuthHeader(req);
      const userId = decoded?.id || decoded?._id || null;

      let qrCodesList;
      if (userId) {
        qrCodesList = Object.values(qrCodes).filter(q => q.userId === userId || q.userId === decoded?.email);
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

      if (!qrCodes[id]) {
        return sendJSON(res, 404, { error: 'QR code not found' });
      }

      delete qrCodes[id];
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

      // CRITICAL: Update KV cache for fast redirects
      // The worker checks KV first for redirects, so we must keep KV in sync.
      // This makes an internal request to the Worker's KV update endpoint.
      // WORKER_URL env var should point to the worker base URL (e.g. https://stiqr.supreme-ai-facts.workers.dev)
      // If WORKER_URL already includes /api/kv/update, use it directly.
      if (updates.destination) {
        const workerUrl = process.env.WORKER_URL || 'https://stiqr.your-subdomain.workers.dev';
        // Remove trailing slash if present
        const baseUrl = workerUrl.replace(/\/+$/, '');
        // If WORKER_URL already contains the full path, use it; otherwise append /api/kv/update
        const kvUrl = baseUrl.includes('/api/kv/update') ? baseUrl : `${baseUrl}/api/kv/update`;
        console.log(`🔄 Updating KV cache: POST ${kvUrl}`);
        fetch(kvUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: id, value: updates.destination }),
        }).then(kvRes => {
          if (kvRes.ok) {
            console.log(`✅ KV cache updated for ${id} -> ${updates.destination}`);
          } else {
            console.warn(`⚠️ KV cache update failed for ${id}: ${kvRes.status}`);
          }
        }).catch(kvErr => {
          console.warn(`⚠️ KV cache update error for ${id}:`, kvErr.message);
        });
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

      const qrCode = qrCodes[id];

      if (!qrCode) {
        console.log(`QR code not found: ${id}`);
        return sendRedirect(res, 'https://www.youtube.com');
      }

      // Increment scan count
      qrCode.scan_count = (qrCode.scan_count || 0) + 1;

      const destination = qrCode.destination || qrCode.qrCodeData;
      console.log(`Redirecting to: ${destination}`);
      return sendRedirect(res, destination);
    }

    // ── Assets: Get all assets ───────────────────────────────────────────────
    if (method === 'GET' && pathname === '/api/assets') {
      // Get the authenticated user's ID from the JWT token
      const decoded = getUserFromAuthHeader(req);
      const userId = decoded?.id || decoded?._id || null;

      if (!userId) {
        console.log('GET /api/assets: No authenticated user, returning empty');
        return sendJSON(res, 200, { stickers: [], logos: [], qrCodes: [] });
      }

      // Filter stickers and logos by userId
      const stickersList = Object.values(stickers).filter(s => s.userId === userId || s.userId === decoded?.email);
      const logosList = Object.values(logos).filter(l => l.userId === userId || l.userId === decoded?.email);

      // Also fetch QR codes from MongoDB filtered by userId
      let qrCodesList = [];
      if (db) {
        try {
          qrCodesList = await db.collection('qrcodes').find({ userId: userId }).toArray();
          console.log(`GET /api/assets: Found ${qrCodesList.length} QR codes in MongoDB for userId: ${userId}`);
        } catch (mongoError) {
          console.error('GET /api/assets: MongoDB query error:', mongoError.message);
        }
      } else {
        // Fallback to in-memory filter
        qrCodesList = Object.values(qrCodes).filter(q => q.userId === userId || q.userId === decoded?.email);
      }

      console.log(`GET /api/assets: returning ${stickersList.length} stickers, ${logosList.length} logos, ${qrCodesList.length} QR codes`);
      return sendJSON(res, 200, { stickers: stickersList, logos: logosList, qrCodes: qrCodesList });
    }

    // ── Stickers: Save ───────────────────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/assets/stickers') {
      const body = await parseBody(req);
      const { data, name, category } = body;
      const id = String(stickerIdCounter++);

      stickers[id] = {
        id,
        data: data || '',
        name: name || 'Untitled Sticker',
        category: category || 'custom',
        userId: req.headers['x-user-email'] || 'anonymous',
        createdAt: new Date().toISOString()
      };

      console.log(`Sticker saved: ${stickers[id].name} (ID: ${id})`);
      return sendJSON(res, 200, { success: true, sticker: stickers[id] });
    }

    // ── Stickers: Delete ─────────────────────────────────────────────────────
    const deleteStickerMatch = matchPath('/api/assets/stickers/:id', pathname);
    if (method === 'DELETE' && deleteStickerMatch) {
      const { id } = deleteStickerMatch;

      if (!stickers[id]) {
        return sendJSON(res, 404, { error: 'Sticker not found' });
      }

      delete stickers[id];
      console.log(`Sticker deleted: ${id}`);
      return sendJSON(res, 200, { success: true, id });
    }

    // ── Logos: Save ──────────────────────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/assets/logos') {
      const body = await parseBody(req);
      const { data, name } = body;
      const id = String(logoIdCounter++);

      logos[id] = {
        id,
        data: data || '',
        name: name || 'Untitled Logo',
        userId: req.headers['x-user-email'] || 'anonymous',
        createdAt: new Date().toISOString()
      };

      console.log(`Logo saved: ${logos[id].name} (ID: ${id})`);
      return sendJSON(res, 200, { success: true, logo: logos[id] });
    }

    // ── Logos: Delete ────────────────────────────────────────────────────────
    const deleteLogoMatch = matchPath('/api/assets/logos/:id', pathname);
    if (method === 'DELETE' && deleteLogoMatch) {
      const { id } = deleteLogoMatch;

      if (!logos[id]) {
        return sendJSON(res, 404, { error: 'Logo not found' });
      }

      delete logos[id];
      console.log(`Logo deleted: ${id}`);
      return sendJSON(res, 200, { success: true, id });
    }

    // ── Scan: Log analytics ──────────────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/scan/log') {
      const body = await parseBody(req);
      scans.push({
        ...body,
        processedAt: new Date().toISOString()
      });

      console.log(`📊 Scan logged: ${body.qrCodeId} from ${body.country || 'unknown'}`);
      return sendJSON(res, 200, { success: true });
    }

    // ── Analytics: Get all ───────────────────────────────────────────────────
    const analyticsMatch = matchPath('/api/analytics/:qrCodeId', pathname);
    if (method === 'GET' && analyticsMatch && !pathname.endsWith('/timeline') && !pathname.endsWith('/summary')) {
      const { qrCodeId } = analyticsMatch;
      const qrScans = scans.filter(s => s.qrCodeId === qrCodeId);

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
      const qrScans = scans.filter(s => s.qrCodeId === qrCodeId);

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
      const qrScans = scans.filter(s => s.qrCodeId === qrCodeId);

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

  const server = http.createServer(handleRequest);

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`   (MongoDB + Stripe webhook + subscription handling enabled)`);
  });
}

startServer();
