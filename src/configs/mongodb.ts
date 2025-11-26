// Basic MongoDB config helper. Use only from server-side code.

const { MONGODB_HOST, MONGODB_USER, MONGODB_PASSWORD } = process.env;

if (!MONGODB_HOST || !MONGODB_USER || !MONGODB_PASSWORD) {
  console.warn('[mongodb config] Missing one or more MongoDB env variables (MONGODB_HOST, MONGODB_USER, MONGODB_PASSWORD).');
}

/**
 * Build a MongoDB connection URI from environment variables.
 * If MONGODB_HOST already includes the mongodb+srv:// prefix, we strip it
 * so we can inject username and password correctly.
 */
export function getMongoUri(): string {
  const host = MONGODB_HOST ?? '';
  const user = MONGODB_USER ?? '';
  const password = MONGODB_PASSWORD ?? '';

  const strippedHost = host.replace(/^mongodb\+srv:\/\//, '');

  return `mongodb+srv://${encodeURIComponent(user)}:${encodeURIComponent(
    password
  )}@${strippedHost}`;
}

export const mongoConfig = {
  host: MONGODB_HOST,
  user: MONGODB_USER,
  password: MONGODB_PASSWORD,
  get uri() {
    return getMongoUri();
  }
};
