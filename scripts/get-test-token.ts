/**
 * Script to generate a test Firebase token
 * 
 * Usage:
 * npx ts-node scripts/get-test-token.ts
 */

import { admin } from '../src/config/firebaseAdmin';

async function getTestToken() {
  try {
    console.log('🔐 Generating test Firebase token...\n');

    // Get a user from Firebase (use the first user)
    const listUsersResult = await admin.auth().listUsers(1);
    
    if (listUsersResult.users.length === 0) {
      console.error('❌ No users found in Firebase Authentication');
      console.log('\n📝 Please create a user in Firebase Console first:');
      console.log('   1. Go to Firebase Console → Authentication');
      console.log('   2. Click "Add user"');
      console.log('   3. Enter email and password');
      process.exit(1);
    }

    const user = listUsersResult.users[0];
    console.log(`✅ Found user: ${user.email}`);

    // Create a custom token for this user
    const customToken = await admin.auth().createCustomToken(user.uid);
    
    console.log('\n🎫 Custom Token (valid for 1 hour):');
    console.log('─'.repeat(80));
    console.log(customToken);
    console.log('─'.repeat(80));

    console.log('\n📋 Use this token in your curl request:\n');
    console.log('curl -X POST http://localhost:9001/auth/login \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log(`  -d '{"idToken": "${customToken}"}'`);

    console.log('\n💡 Or in Postman:');
    console.log('   1. POST http://localhost:9001/auth/login');
    console.log('   2. Body (raw JSON):');
    console.log(`   {"idToken": "${customToken}"}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

getTestToken();
