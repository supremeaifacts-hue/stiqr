// /edge-functions/auth/signup.js
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

// ✅ Use onRequestPost for POST requests
export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { email, password, name } = body;
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const db = await getDb();
    const usersCollection = db.collection('users');
    
    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Create new user
    const newUser = {
      email,
      password, // TODO: hash this in production
      name: name || email.split('@')[0],
      createdAt: new Date(),
      subscriptionStatus: 'free'
    };
    
    await usersCollection.insertOne(newUser);
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'User created successfully',
      user: { email, name: newUser.name }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Signup error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle non-POST requests
export async function onRequestGet() {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}