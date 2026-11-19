const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb+srv://ashutoshkdubey007_db_user:2Q6zFv041FpOg3mq@vicecity.dhrnfsi.mongodb.net/vicepulse?retryWrites=true&w=majority';

async function seedAutonomous() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas');

  const db = mongoose.connection.db;

  const sources = [
    {
      name: 'YouTube Data API & Discovery Recon',
      platform: 'youtube',
      url: 'https://youtube.com',
      feedUrl: 'https://www.googleapis.com/youtube/v3/search',
      enabled: true,
      checkIntervalMinutes: 180,
      reliabilityScore: 5,
      itemsFoundTotal: 48,
      errorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Reddit r/GTA6',
      platform: 'reddit',
      url: 'https://reddit.com/r/GTA6',
      feedUrl: 'https://www.reddit.com/r/GTA6/hot.json',
      enabled: true,
      checkIntervalMinutes: 240,
      reliabilityScore: 4,
      itemsFoundTotal: 62,
      errorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Reddit r/GTA6leaks',
      platform: 'reddit',
      url: 'https://reddit.com/r/GTA6leaks',
      feedUrl: 'https://www.reddit.com/r/GTA6leaks/hot.json',
      enabled: true,
      checkIntervalMinutes: 240,
      reliabilityScore: 4,
      itemsFoundTotal: 35,
      errorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Gaming Press RSS Feeds',
      platform: 'rss',
      url: 'https://www.ign.com/gta-6',
      feedUrl: 'https://feeds.feedburner.com/ign/games-all',
      enabled: true,
      checkIntervalMinutes: 180,
      reliabilityScore: 5,
      itemsFoundTotal: 29,
      errorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Rockstar Newswire Official',
      platform: 'rockstar_official',
      url: 'https://www.rockstargames.com/newswire',
      feedUrl: 'https://www.rockstargames.com/newswire.xml',
      enabled: true,
      checkIntervalMinutes: 360,
      reliabilityScore: 5,
      itemsFoundTotal: 14,
      errorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Social Media & Web Recon (X/TikTok)',
      platform: 'web',
      url: 'https://x.com',
      feedUrl: 'https://api.socialsearch.internal/v1/gta6',
      enabled: true,
      checkIntervalMinutes: 360,
      reliabilityScore: 3,
      itemsFoundTotal: 19,
      errorCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const s of sources) {
    await db.collection('researchsources').updateOne(
      { name: s.name },
      { $set: s },
      { upsert: true }
    );
  }
  console.log(`Seeded ${sources.length} research sources.`);

  const queries = [
    { query: 'GTA 6 hidden locations', category: 'hidden-location', priority: 'high', origin: 'initial', enabled: true, relevanceScore: 95 },
    { query: 'GTA VI easter eggs', category: 'easter-egg', priority: 'high', origin: 'initial', enabled: true, relevanceScore: 92 },
    { query: 'GTA 6 rare vehicles spawn', category: 'rare-vehicle', priority: 'high', origin: 'initial', enabled: true, relevanceScore: 94 },
    { query: 'GTA 6 random encounters', category: 'encounter', priority: 'normal', origin: 'initial', enabled: true, relevanceScore: 88 },
    { query: 'GTA VI underground interiors', category: 'hidden-location', priority: 'normal', origin: 'initial', enabled: true, relevanceScore: 90 },
    { query: 'GTA 6 wildlife locations', category: 'wildlife', priority: 'normal', origin: 'initial', enabled: true, relevanceScore: 86 },
    { query: 'GTA 6 unusual weather tide events', category: 'unusual-event', priority: 'normal', origin: 'initial', enabled: true, relevanceScore: 85 },
    { query: 'GTA 6 secret military airbase', category: 'rare-vehicle', priority: 'high', origin: 'initial', enabled: true, relevanceScore: 96 },
  ];

  for (const q of queries) {
    await db.collection('researchqueries').updateOne(
      { query: q.query },
      { $set: { ...q, itemsFoundCount: 5, lastRunAt: new Date() } },
      { upsert: true }
    );
  }
  console.log(`Seeded ${queries.length} initial research queries.`);

  // Seed default EngineConfig if not exists
  await db.collection('engineconfigs').updateOne(
    { key: 'global_engine_settings' },
    {
      $setOnInsert: {
        key: 'global_engine_settings',
        researchEnginePaused: false,
        autoPublishEnabled: true,
        discoverySearchIntervalHours: 3,
        redditMonitoringIntervalHours: 4,
        queryExpansionIntervalHours: 6,
        corroborationIntervalHours: 12,
        dailyBudgetCapUSD: 5.0,
        totalTokensUsedToday: 4200,
        estimatedCostTodayUSD: 0.045,
        lastBudgetResetDate: new Date().toISOString().split('T')[0],
        enabledConnectors: {
          youtube: true,
          reddit: true,
          rss: true,
          social: true,
        },
      },
    },
    { upsert: true }
  );
  console.log('Engine configuration verified.');

  await mongoose.disconnect();
}

seedAutonomous().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
