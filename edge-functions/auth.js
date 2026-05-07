import { getDb } from './mongodb.js';

// Helper function for JSON responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

// Handle POST /auth/signup
export async function onRequestPost(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Signup
  if (pathname === '/auth/signup') {
    try {
      const body = await context.request.json();
      const { email, password, name } = body;

      if (!email || !password) {
        return jsonResponse({ error: 'Email and password required' }, 400);
      }

      const db = await getDb();
      const usersCollection = db.collection('users');

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return jsonResponse({ error: 'User already exists' }, 400);
      }

      const newUser = {
        email,
        password,
        name: name || email.split('@')[0],
        createdAt: new Date(),
        subscriptionStatus: 'free'
      };

      await usersCollection.insertOne(newUser);

      return jsonResponse({
        success: true,
        message: 'User created successfully',
        user: { email, name: newUser.name }
      }, 201);
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  }

  // Login
  if (pathname === '/auth/login') {
    try {
      const body = await context.request.json();
      const { email, password } = body;

      if (!email || !password) {
        return jsonResponse({ error: 'Email and password required' }, 400);
      }

      const db = await getDb();
      const usersCollection = db.collection('users');
      const user = await usersCollection.findOne({ email, password });

      if (!user) {
        return jsonResponse({ error: 'Invalid email or password' }, 401);
      }

      return jsonResponse({
        success: true,
        user: {
          email: user.email,
          name: user.name,
          subscriptionStatus: user.subscriptionStatus
        }
      }, 200);
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  }

  return jsonResponse({ error: 'Not found' }, 404);
}

// Handle GET /auth/status
export async function onRequestGet(context) {
  const url = new URL(context.request.url);

  if (url.pathname === '/auth/status') {
    return jsonResponse({ authenticated: false, message: 'Auth function working' });
  }

  return jsonResponse({ error: 'Not found' }, 404);
}