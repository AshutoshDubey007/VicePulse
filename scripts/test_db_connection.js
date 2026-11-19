const mongoose = require('mongoose');

const uri = 'mongodb+srv://ashutoshkdubey007_db_user:2Q6zFv041FpOg3mq@vicecity.dhrnfsi.mongodb.net/vicepulse?retryWrites=true&w=majority';

async function testConnection() {
  console.log('Testing connection to MongoDB Atlas...');
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('SUCCESS: Successfully connected to MongoDB Atlas cluster (vicecity.dhrnfsi.mongodb.net)!');
    console.log('Database name:', mongoose.connection.name);
    console.log('Ready state:', mongoose.connection.readyState);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Existing collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('Disconnected cleanly.');
  } catch (err) {
    console.error('ERROR: Failed to connect to MongoDB Atlas:', err);
    process.exit(1);
  }
}

testConnection();
