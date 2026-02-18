import { env } from '$env/dynamic/private';
import { MongoClient, type MongoClientOptions, type Db } from 'mongodb';

const { MONGODB_HOST, MONGODB_USER, MONGODB_PASSWORD, MONGODB_NAME } = env;

if (!MONGODB_HOST || !MONGODB_USER || !MONGODB_PASSWORD) {
  console.warn('[mongodb config] Missing one or more MongoDB env variables (MONGODB_HOST, MONGODB_USER, MONGODB_PASSWORD).');
}

/**
 * Build a MongoDB connection URI from environment variables.
 * If MONGODB_HOST already includes the mongodb+srv:// prefix, we strip it
 * so we can inject username and password correctly.
 */
function getMongoUri(): string {
  const host = MONGODB_HOST ?? '';
  const user = MONGODB_USER ?? '';
  const password = MONGODB_PASSWORD ?? '';
  const dbName = MONGODB_NAME ?? 'maujuara';

  const strippedHost = host.replace(/^mongodb\+srv:\/\//, '');

  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(
    password
  )}@${strippedHost}/${dbName}`;
}

// MongoDB client instance
let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Get MongoDB client instance (singleton pattern)
 */
export function getMongoClient(): MongoClient {
  if (!client) {
    const uri = getMongoUri();
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      // Connection pool configuration
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2,  // Minimum number of connections to maintain
      maxIdleTimeMS: 10000, // Close connections after 30 seconds of inactivity
      waitQueueTimeoutMS: 5000, // How long to wait for a connection from the pool
      retryWrites: true, // Retry write operations if they fail
      retryReads: true   // Retry read operations if they fail
    } as MongoClientOptions);
  }
  return client;
}

/**
 * Get database instance (singleton pattern)
 */
export async function getDatabase(): Promise<Db> {
  if (!db) {
    const client = getMongoClient();
    await client.connect();
    db = client.db();
  }
  return db;
}

/**
 * Close MongoDB connection
 */
export async function closeMongoConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

/**
 * Execute database operation with automatic connection management
 */
export async function withDatabase<T>(
  operation: (db: Db) => Promise<T>
): Promise<T> {
  try {
    const db = await getDatabase();
    return await operation(db);
  } finally {
    // Note: We don't close the connection here to allow connection pooling
    // Connection will be closed when the server shuts down
  }
}

export const mongoConfig = {
  host: MONGODB_HOST,
  user: MONGODB_USER,
  password: MONGODB_PASSWORD,
  database: MONGODB_NAME,
  get uri() {
    return getMongoUri();
  }
};
