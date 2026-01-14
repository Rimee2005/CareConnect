// Simple script to test MongoDB connection and create the database
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Create a test collection to ensure database is created
    const db = mongoose.connection.db;
    const testCollection = db.collection('_test');
    await testCollection.insertOne({ test: true, createdAt: new Date() });
    await testCollection.deleteOne({ test: true });
    
    console.log('✅ Database "careconnect" has been created!');
    console.log('📊 You should now see it in MongoDB Compass');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
}

testConnection();

