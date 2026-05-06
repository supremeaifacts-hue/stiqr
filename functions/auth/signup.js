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
    const { email, password, name } = body;

    console.log('Signup attempt:', email);

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email and password required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return new Response(JSON.stringify({ error: 'User already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      email: email.toLowerCase(),
      displayName: name || email.split('@')[0],
      password: hashedPassword,
      authProvider: 'local',
      createdAt: new Date()
    };

    const result = await users.insertOne(user);
    user._id = result.insertedId;

    const token = generateToken(user);

    return new Response(JSON.stringify({
      success: true,
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName
      }
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' }
  });
}
