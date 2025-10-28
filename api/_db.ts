import { neon } from '@neondatabase/serverless'

export function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set. Define it in your environment (.env.local for vercel dev or project settings in Vercel).')
  }
  return neon(url)
}

export async function withTx<T>(fn: (exec: ReturnType<typeof getSql>) => Promise<T>) {
  const sql = getSql()
  await sql`BEGIN`
  try {
    const res = await fn(sql)
    await sql`COMMIT`
    return res
  } catch (err) {
    await sql`ROLLBACK`
    throw err
  }
}

// Ensure required extension/tables exist (safe to call multiple times)
export async function ensureBaseSchema() {
  const sql = getSql()
  try { await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"` } catch (_) { /* ignore lack of permission */ }
  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('product','service')),
      image_url TEXT,
      initial_stock INTEGER,
      sold INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`
  await sql`
    CREATE TABLE IF NOT EXISTS sales (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
      item_name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      price_per_unit NUMERIC(12,2) NOT NULL,
      total_amount NUMERIC(12,2) NOT NULL,
      commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      date TIMESTAMPTZ NOT NULL,
      bundle_id UUID
    )`
  await sql`CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)`
  await sql`CREATE INDEX IF NOT EXISTS idx_sales_bundle ON sales(bundle_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_items_name ON items(name)`
}

export async function ensureAuthSchema() {
  const sql = getSql()
  try { await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"` } catch (_) { /* ignore lack of permission */ }
  await sql`
    CREATE TABLE IF NOT EXISTS auth_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username TEXT UNIQUE NOT NULL,
      pass_salt TEXT,
      pass_hash TEXT,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`
}

// Add per-user ownership columns for multi-tenant separation
export async function ensureOwnershipSchema() {
  const sql = getSql()
  try { await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS owner TEXT` } catch (_) {}
  try { await sql`ALTER TABLE items ADD COLUMN IF NOT EXISTS owner_username TEXT` } catch (_) {}
  try { await sql`CREATE INDEX IF NOT EXISTS idx_items_owner ON items(owner)` } catch (_) {}
  try { await sql`CREATE INDEX IF NOT EXISTS idx_items_owner_username ON items(owner_username)` } catch (_) {}
  try { await sql`ALTER TABLE sales ADD COLUMN IF NOT EXISTS owner TEXT` } catch (_) {}
  try { await sql`ALTER TABLE sales ADD COLUMN IF NOT EXISTS owner_username TEXT` } catch (_) {}
  try { await sql`CREATE INDEX IF NOT EXISTS idx_sales_owner ON sales(owner)` } catch (_) {}
  try { await sql`CREATE INDEX IF NOT EXISTS idx_sales_owner_username ON sales(owner_username)` } catch (_) {}
}
