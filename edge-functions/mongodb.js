import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

export async function getDb() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }
  
  if (!cachedDb) {
    cachedDb = cachedClient.db('stiqr');
  }
  
  return cachedDb;
}