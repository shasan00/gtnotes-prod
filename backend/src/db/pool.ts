import { Pool } from "pg";
import { Buffer } from "buffer";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

    const sslConfig = process.env.RDS_CA_BASE64
      ? { ca: Buffer.from(process.env.RDS_CA_BASE64, "base64").toString("utf-8") }
      : {  require: true, rejectUnauthorized: false }; // dev: force SSL, ignore self-signed

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig,
    });
  }
  return pool;
}

export async function initDb(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL is not set. Skipping DB initialization.");
    return;
  }
  const p = getPool();
  // enables pgcrypto for gen_random_uuid if available
  await p.query(`create extension if not exists pgcrypto;`).catch(() => {});
  await p.query(`
    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      email text not null unique,
      password_hash text,
      google_id text,
      microsoft_id text,
      first_name text,
      last_name text,
      role text not null default 'user',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);
  
  // Create notes table
  await p.query(`
    create table if not exists notes (
      id uuid primary key default gen_random_uuid(),
      title text not null,
      course text not null,
      professor text not null,
      semester text not null,
      description text,
      file_key text not null,
      file_name text not null,
      file_size text not null,
      file_type text not null,
      status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
      uploaded_by uuid not null references users(id),
      approved_by uuid references users(id),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `);
  
  // Create note_status enum if it doesn't exist
  try {
    await p.query(`create type note_status as enum ('pending', 'approved', 'rejected');`);
  } catch (e: any) {
    // enum already exists, ignore error
    if (!e.message?.includes('already exists')) {
      console.warn('Could not create note_status enum:', e.message);
    }
  }
  
  // adds google_id column if it doesn't exist (for existing tables)
  try {
    await p.query(`ALTER TABLE users ADD COLUMN google_id text;`);
  } catch (e: any) {
    // column already exists, ignore error
    if (!e.message?.includes('already exists')) {
      console.warn('Could not add google_id column:', e.message);
    }
  }
  // ensures partial unique index for google_id when present
  await p
    .query(
      `create unique index if not exists idx_users_google_id on users(google_id) where google_id is not null;`
    )
    .catch(() => {});
  // adds microsoft_id column if it doesn't exist (for existing tables)
  try {
    await p.query(`ALTER TABLE users ADD COLUMN microsoft_id text;`);
  } catch (e: any) {
    // column already exists, ignore error
    if (!e.message?.includes('already exists')) {
      console.warn('Could not add microsoft_id column:', e.message);
    }
  }
  // ensures partial unique index for microsoft_id when present
  await p
    .query(
      `create unique index if not exists idx_users_microsoft_id on users(microsoft_id) where microsoft_id is not null;`
    )
    .catch(() => {});
  try {
    await p.query(`ALTER TABLE users ADD COLUMN role text not null default 'user';`);
  } catch (e: any) {
    // column already exists, ignore error
    if (!e.message?.includes('already exists')) {
      console.warn('Could not add role column:', e.message);
    }
  }
}


