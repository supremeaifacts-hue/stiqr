// /edge-functions/auth/login.js
import { MongoClient } from 'mongodb';

let cachedClient = null;

async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }
  return cachedClient.db('stiqr');
}

export async function onRequest(context) {
  // Only allow POST
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    const body = await context.request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check against MongoDB
    const db = await getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email, password });
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Return user info (excluding password)
    return new Response(JSON.stringify({ 
      success: true, 
      user: {
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscriptionStatus || 'free'
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
