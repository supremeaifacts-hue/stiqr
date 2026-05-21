/**
 * Migration Script: Add userId to existing QR codes in MongoDB
 *
 * This script finds all QR codes in the 'qrcodes' collection that don't have
 * a userId field, and attempts to assign them to the correct user.
 *
 * Strategy:
 * 1. First, try to match QR codes to users by looking at the 'user' collection
 *    and checking if any user has a reference to the QR code (e.g., in their assets).
 * 2. If no match found, the QR code is listed for manual review.
 *
 * Usage: node backend/migrate_qrcodes_userid.js
 */

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stiqr';

async function migrate() {
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db('stiqr');
    const qrcodesCollection = db.collection('qrcodes');
    const usersCollection = db.collection('users');

    // Find all QR codes without a userId
    const orphanedQrCodes = await qrcodesCollection.find({
      $or: [
        { userId: { $exists: false } },
        { userId: null },
        { userId: '' }
      ]
    }).toArray();

    console.log(`Found ${orphanedQrCodes.length} QR codes without userId`);

    if (orphanedQrCodes.length === 0) {
      console.log('✅ All QR codes already have userId. Nothing to migrate.');
      await client.close();
      return;
    }

    // Get all users for matching
    const users = await usersCollection.find({}).toArray();
    console.log(`Found ${users.length} users in the database`);

    let assignedCount = 0;
    let unassignedCount = 0;
    const unassignedIds = [];

    for (const qrCode of orphanedQrCodes) {
      let matchedUser = null;

      // Strategy 1: Try to match by email if the QR code has an email field
      if (qrCode.email || qrCode.userEmail) {
        const email = (qrCode.email || qrCode.userEmail).toLowerCase();
        matchedUser = users.find(u => u.email?.toLowerCase() === email);
      }

      // Strategy 2: Try to match by checking if any user has this QR code ID in their assets
      if (!matchedUser) {
        for (const user of users) {
          if (user.qrCodes && Array.isArray(user.qrCodes)) {
            const hasQrCode = user.qrCodes.some(q => q.id === qrCode.id || q.qrCodeId === qrCode.id);
            if (hasQrCode) {
              matchedUser = user;
              break;
            }
          }
        }
      }

      // Strategy 3: Try to match by checking the 'user' field if it exists
      if (!matchedUser && qrCode.user) {
        const userId = typeof qrCode.user === 'string' ? qrCode.user : qrCode.user.toString();
        try {
          matchedUser = users.find(u => u._id.toString() === userId);
        } catch (e) {
          // Not a valid ObjectId
        }
      }

      if (matchedUser) {
        // Assign the QR code to the matched user
        await qrcodesCollection.updateOne(
          { _id: qrCode._id },
          { $set: { userId: matchedUser._id.toString() } }
        );
        console.log(`✅ Assigned QR code ${qrCode.id} to user ${matchedUser.email} (${matchedUser._id})`);
        assignedCount++;
      } else {
        console.log(`⚠️ Could not determine owner for QR code ${qrCode.id} (destination: ${qrCode.destination?.substring(0, 50)})`);
        unassignedCount++;
        unassignedIds.push(qrCode.id);
      }
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('📊 Migration Summary:');
    console.log(`   Total orphaned QR codes: ${orphanedQrCodes.length}`);
    console.log(`   ✅ Assigned: ${assignedCount}`);
    console.log(`   ⚠️  Unassigned: ${unassignedCount}`);
    console.log('═══════════════════════════════════════════');

    if (unassignedIds.length > 0) {
      console.log('\n📝 Unassigned QR code IDs (manual review needed):');
      unassignedIds.forEach(id => console.log(`   - ${id}`));
      console.log('\nTo manually assign these, run:');
      console.log(`   db.qrcodes.updateOne({ id: "<QR_CODE_ID>" }, { $set: { userId: "<USER_OBJECT_ID>" } })`);
    }

    await client.close();
  } catch (error) {
    console.error('Migration failed:', error);
    if (client) await client.close();
    process.exit(1);
  }
}

migrate();
