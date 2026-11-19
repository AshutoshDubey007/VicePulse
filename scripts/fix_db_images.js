const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://ashutoshkdubey007_db_user:2Q6zFv041FpOg3mq@vicecity.dhrnfsi.mongodb.net/vicepulse';

async function fixDb() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const vRes = await db.collection('vehicles').updateMany(
    { evidenceImage: { $regex: 'photo-1569263979104-865ab7cd8d17' } },
    { $set: { evidenceImage: '/images/vehicles/jetmax.webp' } }
  );
  console.log('Vehicles updated:', vRes.modifiedCount);

  const dRes = await db.collection('discoveries').updateMany(
    { 'evidenceImages.url': { $regex: 'photo-1569263979104-865ab7cd8d17' } },
    { $set: { 'evidenceImages.$[elem].url': '/images/vehicles/jetmax.webp' } },
    { arrayFilters: [{ 'elem.url': { $regex: 'photo-1569263979104-865ab7cd8d17' } }] }
  );
  console.log('Discoveries updated:', dRes.modifiedCount);

  await mongoose.disconnect();
}

fixDb().catch(console.error);
