import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getPool } from './pool';
import * as schema from './schema';

// Create Drizzle instance using existing pool - lazy load to avoid startup errors
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    _db = drizzle(getPool(), { schema });
  }
  return _db;
}

// Export the schema for use in other files
export * from './schema';
