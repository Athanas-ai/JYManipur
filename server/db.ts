
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import * as authSchema from "@shared/models/auth";

const { Pool } = pg;

// Lazy load db only if DATABASE_URL is set to avoid errors when running with in-memory storage
let _pool: any = null;
let _db: any = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set; cannot create database connection");
  }
  if (!_pool) {
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
    _db = drizzle(_pool, { schema: { ...schema, ...authSchema } });
  }
  return _db;
}

export const pool = _pool;
export const db = new Proxy({}, {
  get: (target, prop) => {
    return getDb()[prop];
  }
}) as any;
