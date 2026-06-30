import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Lazy DB client. The Pool is created on first use (never at import time) so the
 * app builds and runs without DATABASE_URL — auth simply stays "not configured"
 * until the env var is set.
 */
let pool: Pool | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    pool = new Pool({ connectionString });
    dbInstance = drizzle(pool, { schema });
  }
  return dbInstance;
}

export { schema };
