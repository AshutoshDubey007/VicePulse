const path = require('path');
const mongoose = require('mongoose');
const jiti = require('jiti')(path.resolve('package.json'));

const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://ashutoshkdubey007_db_user:2Q6zFv041FpOg3mq@vicecity.dhrnfsi.mongodb.net/vicepulse?retryWrites=true&w=majority';

// Load mock data
const { 
  mockDiscoveries, 
  mockRareVehicles, 
  mockSources, 
  mockComments, 
  mockUsers 
} = jiti('./src/data/mockData.ts');

// Schemas
const DiscoverySchema = new mongoose.Schema({
  title: String,
  slug: { type: String, unique: true },
  category: String,
  subcategory: String,
  locationName: String,
  district: String,
  coordinates: {
    lat: Number,
    lng: Number,
    inGameGrid: String,
  },
  description: String,
  stepsToFind: [String],
  inGameTime: String,
  weather: String,
  requirements: [String],
  evidenceImages: [{
    url: String,
    caption: String,
    type: { type: String, default: 'screenshot' }
  }],
  source: {
    platform: String,
    url: String,
    author: String,
    timestamp: String,
  },
  verificationStatus: String,
  verificationReason: String,
  confirmationsCount: { type: Number, default: 0 },
  confirmedBy: [String],
  disputeCount: { type: Number, default: 0 },
  disputes: [{
    id: String,
    reason: String,
    reportedBy: String,
    createdAt: String,
  }],
  tags: [String],
  submittedBy: {
    id: String,
    username: String,
    role: String,
    avatar: String,
  },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

const VehicleSchema = new mongoose.Schema({
  name: String,
  modelName: String,
  vehicleClass: String,
  description: String,
  reportedLocation: String,
  district: String,
  coordinates: {
    lat: Number,
    lng: Number,
    inGameGrid: String,
  },
  spawnConditions: {
    time: String,
    weather: String,
    storyProgression: String,
  },
  evidenceImage: String,
  verificationStatus: String,
  confirmationsCount: { type: Number, default: 0 },
  rarity: String,
  speedRating: Number,
  accelerationRating: Number,
}, { timestamps: true });

const SourceSchema = new mongoose.Schema({
  originalUrl: String,
  platform: String,
  author: String,
  contentTitle: String,
  dateDiscovered: String,
  datePublished: String,
  extractedDiscoveries: [String],
  status: String,
  reliabilityNotes: String,
  reliabilityScore: Number,
}, { timestamps: true });

const CommentSchema = new mongoose.Schema({
  discoveryId: String,
  userId: String,
  username: String,
  userAvatar: String,
  userRole: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [String],
  reproductionAttempt: {
    attempted: Boolean,
    success: Boolean,
    notes: String,
    evidenceUrl: String,
  },
}, { timestamps: true });

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  planId: String,
  billingCycle: String,
  status: String,
  provider: String,
  providerSubscriptionId: String,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  cancelAtPeriodEnd: Boolean,
  features: [String],
}, { timestamps: true });

const NotificationSettingsSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  marketingEmails: Boolean,
  weeklyDigest: Boolean,
  discoveryUpdates: Boolean,
  commentReplies: Boolean,
  securityAndTransactional: Boolean,
  unsubscribeToken: { type: String, unique: true },
}, { timestamps: true });

const Discovery = mongoose.models.Discovery || mongoose.model('Discovery', DiscoverySchema);
const Vehicle = mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);
const Source = mongoose.models.Source || mongoose.model('Source', SourceSchema);
const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
const Subscription = mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
const NotificationSettings = mongoose.models.NotificationSettings || mongoose.model('NotificationSettings', NotificationSettingsSchema);

async function seed() {
  console.log('Connecting to MongoDB Atlas at:', MONGODB_URI.replace(/:[^:]*@/, ':****@'));
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('Successfully connected to database:', mongoose.connection.name);

  // 1. Seed Discoveries
  console.log('\n--- Seeding Discoveries ---');
  for (const disc of mockDiscoveries) {
    await Discovery.findOneAndUpdate(
      { slug: disc.slug },
      {
        ...disc,
        createdAt: new Date(disc.createdAt),
        updatedAt: new Date(disc.updatedAt),
      },
      { upsert: true, new: true }
    );
  }
  const discCount = await Discovery.countDocuments();
  console.log(`[PASS] Discoveries in database: ${discCount}`);

  // 2. Seed Rare Vehicles
  console.log('\n--- Seeding Rare Vehicles ---');
  for (const veh of mockRareVehicles) {
    await Vehicle.findOneAndUpdate(
      { name: veh.name, modelName: veh.modelName },
      { ...veh },
      { upsert: true, new: true }
    );
  }
  const vehCount = await Vehicle.countDocuments();
  console.log(`[PASS] Vehicles in database: ${vehCount}`);

  // 3. Seed Sources
  console.log('\n--- Seeding Ingestion Sources ---');
  for (const src of mockSources) {
    await Source.findOneAndUpdate(
      { originalUrl: src.originalUrl },
      { ...src },
      { upsert: true, new: true }
    );
  }
  const srcCount = await Source.countDocuments();
  console.log(`[PASS] Sources in database: ${srcCount}`);

  // 4. Seed Comments
  console.log('\n--- Seeding Comments ---');
  for (const comm of mockComments) {
    await Comment.findOneAndUpdate(
      { discoveryId: comm.discoveryId, content: comm.content },
      {
        ...comm,
        createdAt: new Date(comm.createdAt),
      },
      { upsert: true, new: true }
    );
  }
  const commCount = await Comment.countDocuments();
  console.log(`[PASS] Comments in database: ${commCount}`);

  // 5. Seed Subscriptions
  console.log('\n--- Seeding User Subscriptions ---');
  const initialSubs = [
    {
      userId: 'usr-1',
      planId: 'free',
      billingCycle: 'monthly',
      status: 'active',
      provider: 'razorpay',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      features: ['basic_browsing', 'community_intel'],
    },
    {
      userId: 'usr-2',
      planId: 'scout_pro',
      billingCycle: 'yearly',
      status: 'active',
      provider: 'razorpay',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      features: ['basic_browsing', 'community_intel', 'classified_overlays', '8k_raw_evidence', 'priority_intake_queue'],
    },
    {
      userId: 'usr-3',
      planId: 'syndicate_elite',
      billingCycle: 'yearly',
      status: 'active',
      provider: 'razorpay',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
      features: ['basic_browsing', 'community_intel', 'classified_overlays', '8k_raw_evidence', 'priority_intake_queue', 'telemetry_api_access', 'custom_scout_callsign'],
    },
  ];
  for (const sub of initialSubs) {
    await Subscription.findOneAndUpdate(
      { userId: sub.userId },
      { ...sub },
      { upsert: true, new: true }
    );
  }
  const subCount = await Subscription.countDocuments();
  console.log(`[PASS] Subscriptions in database: ${subCount}`);

  // 6. Seed Notification Settings
  console.log('\n--- Seeding Notification Settings ---');
  for (const u of mockUsers) {
    await NotificationSettings.findOneAndUpdate(
      { userId: u.id },
      {
        userId: u.id,
        marketingEmails: true,
        weeklyDigest: true,
        discoveryUpdates: true,
        commentReplies: true,
        securityAndTransactional: true,
        unsubscribeToken: `unsub_${u.id}_${Buffer.from(u.email).toString('hex')}`,
      },
      { upsert: true, new: true }
    );
  }
  const notifCount = await NotificationSettings.countDocuments();
  console.log(`[PASS] Notification settings in database: ${notifCount}`);

  console.log('\n======================================================');
  console.log('DATABASE SEEDING SUCCESSFUL & VERIFIED IN MONGODB ATLAS');
  console.log('======================================================');
  
  await mongoose.disconnect();
  console.log('Disconnected cleanly.');
}

seed().catch(err => {
  console.error('Database seeding failed:', err);
  process.exit(1);
});
