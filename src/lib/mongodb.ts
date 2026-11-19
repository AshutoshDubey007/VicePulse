import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vicepulse';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose | null> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10s timeout for remote cloud MongoDB Atlas
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('[VicePulse DB] Connected successfully to MongoDB:', m.connection.host, m.connection.name);
      return m;
    }).catch((err) => {
      console.warn('[VicePulse DB] MongoDB not reachable, using in-memory intelligence store fallback:', err.message);
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch {
    cached.promise = null;
    return null;
  }
}

export const connectDB = connectToDatabase;
export default connectToDatabase;

