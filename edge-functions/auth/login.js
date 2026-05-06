// ✅ CORRECT - Use onRequestPost for POST requests
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stiqr';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

let client;
let clientPromise;

if (!clientPromise) {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export async function onRequestPost(context) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const users = db.collection('users');
    
    const body = await context.request.json();
    const { email, password } = body;
    
    console.log('Login attempt:', email);
    
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Find user
    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Generate token
    const token = generateToken(user);
    
    return new Response(JSON.stringify({ 
      success: true, 
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName
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

// Handle GET requests to this endpoint (return 405)
export async function onRequestGet() {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
