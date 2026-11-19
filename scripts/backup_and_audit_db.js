const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vicepulse';

async function main() {
  console.log('Connecting to MongoDB at:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));
  const conn = await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  });

  const db = conn.connection.db;
  console.log(`Successfully connected to database: ${db.databaseName}`);

  const collections = await db.listCollections().toArray();
  console.log(`Found ${collections.length} collections:`);

  const backupDir = path.join(__dirname, '..', 'backups', `db_backup_${Date.now()}`);
  fs.mkdirSync(backupDir, { recursive: true });

  const auditReport = {
    timestamp: new Date().toISOString(),
    databaseName: db.databaseName,
    collections: {},
    totalDocuments: 0
  };

  for (const colInfo of collections) {
    const colName = colInfo.name;
    const col = db.collection(colName);
    const count = await col.countDocuments();
    const docs = await col.find({}).toArray();

    auditReport.collections[colName] = {
      count,
      sampleId: docs[0]?._id || null,
      indexes: await col.indexes()
    };
    auditReport.totalDocuments += count;

    // Save JSON backup of each collection
    const backupFilePath = path.join(backupDir, `${colName}.json`);
    fs.writeFileSync(backupFilePath, JSON.stringify(docs, null, 2), 'utf8');

    console.log(` - Collection '${colName}': ${count} documents backed up to ${path.basename(backupFilePath)}`);
  }

  const reportPath = path.join(backupDir, 'audit_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(auditReport, null, 2), 'utf8');
  console.log(`\nAudit and backup completed successfully!`);
  console.log(`Total documents across all collections: ${auditReport.totalDocuments}`);
  console.log(`Backup saved in: ${backupDir}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Database backup failed:', err);
  process.exit(1);
});
