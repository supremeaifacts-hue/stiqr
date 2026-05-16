const http = require('http');
const { randomUUID } = require('crypto');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'stiqr-jwt-secret-dev';

// ─── In-Memory Data Stores ────────────────────────────────────────────────────
const users = {};           // email -> { email, password, name, createdAt, subscription }
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
        const customerEmail = session.customer_email || clientReferenceId;

        // Determine plan type from the subscription
        let planType = 'pro';
        if (session.metadata && session.metadata.plan) {
          planType = session.metadata.plan;
        } else {
          // Try to determine from price
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          if (lineItems.data.length > 0) {
            const priceId = lineItems.data[0].price.id;
            if (priceId === process.env.STRIPE_ULTRA_PRICE_ID) {
              planType = 'ultra';
            }
          }
        }

        // Find the user by email or client_reference_id
        const userEmail = customerEmail || clientReferenceId;
        let user = users[userEmail];

        // If user not found by email, try to find by client_reference_id
        if (!user && clientReferenceId && clientReferenceId !== userEmail) {
          user = users[clientReferenceId];
        }

        if (user) {
          user.subscription = {
            planType: planType,
            subscriptionStatus: 'active',
            stripeSubscriptionId: session.subscription,
            stripeSessionId: session.id,
            subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
          };
          console.log(`✅ Subscription activated for ${user.email}: ${planType}`);
        } else {
          // Create a user record if they don't exist yet (e.g., they signed up via Stripe)
          const email = customerEmail || clientReferenceId;
          if (email) {
            users[email] = {
              email,
              name: email.split('@')[0],
              password: '',
              createdAt: new Date().toISOString(),
              subscription: {
                planType: planType,
                subscriptionStatus: 'active',
                stripeSubscriptionId: session.subscription,
                stripeSessionId: session.id,
                subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date().toISOString()
              }
            };
            console.log(`✅ New user created via webhook: ${email} with ${planType} plan`);
          }
        }
      }

      // Handle subscription updates
      if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        const isDeleted = event.type === 'customer.subscription.deleted';

        // Find the user by stripe subscription ID
        for (const email of Object.keys(users)) {
          if (users[email].subscription?.stripeSubscriptionId === subscription.id) {
            if (isDeleted) {
              users[email].subscription.subscriptionStatus = 'canceled';
              users[email].subscription.planType = 'free';
              console.log(`❌ Subscription canceled for ${email}`);
            } else {
              users[email].subscription.subscriptionStatus = subscription.status === 'active' ? 'active' : 'incomplete';
              users[email].subscription.subscriptionEndDate = new Date(subscription.current_period_end * 1000).toISOString();
              console.log(`🔄 Subscription updated for ${email}: ${subscription.status}`);
            }
            break;
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

      if (users[email]) {
        return sendJSON(res, 400, { error: 'User already exists' });
      }

      users[email] = {
        email,
        password,
        name: name || email.split('@')[0],
        createdAt: new Date().toISOString()
      };

      console.log(`✅ User created: ${email}`);
      return sendJSON(res, 200, { success: true, message: 'User created', email });
    }

    // ── Auth: Login ──────────────────────────────────────────────────────────
    if (method === 'POST' && pathname === '/auth/login') {
      const body = await parseBody(req);
      const { email, password } = body;

      const user = users[email];
      if (!user || user.password !== password) {
        return sendJSON(res, 401, { error: 'Invalid credentials' });
      }

      return sendJSON(res, 200, {
        success: true,
        user: { email: user.email, name: user.name }
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
      // Try to get user from JWT token
      const decoded = getUserFromAuthHeader(req);
      let userEmail = decoded?.email || null;

      // Fallback to x-user-email header
      if (!userEmail) {
        userEmail = req.headers['x-user-email'] || null;
      }

      if (!userEmail) {
        return sendJSON(res, 200, { subscriptionStatus: 'free', planType: 'free' });
      }

      const user = users[userEmail];

      if (!user || !user.subscription) {
        return sendJSON(res, 200, { subscriptionStatus: 'free', planType: 'free' });
      }

      return sendJSON(res, 200, {
        subscriptionStatus: user.subscription.subscriptionStatus || 'free',
        planType: user.subscription.planType || 'free',
        subscriptionEndDate: user.subscription.subscriptionEndDate || null,
        updatedAt: user.subscription.updatedAt || null
      });
    }

    // ── QR Codes: Save standalone ────────────────────────────────────────────
    if (method === 'POST' && pathname === '/api/qrcodes') {
      const body = await parseBody(req);
      const { id, destination, qrCodeData } = body;

      if (!id) {
        return sendJSON(res, 400, { error: 'id is required' });
      }

      qrCodes[id] = {
        id,
        destination: destination || '',
        qrCodeData: qrCodeData || '',
        createdAt: new Date().toISOString(),
        scan_count: 0
      };

      console.log(`✅ QR code saved: ${id} -> ${destination}`);
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

      console.log(`Saving QR code to user assets: ${finalId}`);

      qrCodes[finalId] = {
        id: finalId,
        name: finalName,
        destination: finalData,
        qrImageData: finalImageData,
        design: design || null,
        userId: req.headers['x-user-email'] || 'anonymous',
        createdAt: new Date().toISOString(),
        scan_count: 0
      };

      return sendJSON(res, 200, { success: true, id: finalId });
    }

    // ── QR Codes: Get all user QR codes ─────────────────────────────────────
    if (method === 'GET' && pathname === '/api/assets/qrcodes') {
      const qrCodesList = Object.values(qrCodes);
      console.log(`Returning ${qrCodesList.length} QR codes`);
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
      const stickersList = Object.values(stickers);
      const logosList = Object.values(logos);
      console.log(`GET /api/assets: returning ${stickersList.length} stickers, ${logosList.length} logos`);
      return sendJSON(res, 200, { stickers: stickersList, logos: logosList });
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

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`   (Stripe webhook + subscription handling enabled)`);
});
