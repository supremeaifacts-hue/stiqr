// Get user from JWT token
import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stiqr';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

let client;
let clientPromise;

if (!clientPromise) {
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

export async function onRequestGet(context) {
  try {
    const authHeader = context.request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'No token provided' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const client = await clientPromise;
    const db = client.db();
    const users = db.collection('users');
    
    // Find user
    const user = await users.findOne({ _id: new ObjectId(decoded.id) });
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ 
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
    console.error('Auth error:', error.message);
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}