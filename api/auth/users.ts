import { neon } from '@neondatabase/serverless'
import { getUserFromRequest } from '../_auth'
import { z } from 'zod'

export const runtime = 'edge'

function isAdmin(username: string | null): boolean {
  const admin = (process.env.ADMIN_USERNAME || 'inka-maia').toLowerCase()
  return !!username && username.toLowerCase() === admin
}

function b64url(buf: ArrayBuffer | Uint8Array) {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i])
  return btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

async function hashCode(code: string, salt: string) {
  const enc = new TextEncoder()
  const data = enc.encode(`${salt}:${code}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return b64url(digest)
}

export async function POST(req: Request) {
  // Create user with 6-digit code (admin only)
  const caller = await getUserFromRequest(req)
  if (!isAdmin(caller)) return new Response('forbidden', { status: 403 })
  try {
    const body = await req.json()
    const schema = z.object({ username: z.string().trim().min(1), code: z.string().regex(/^\d{6}$/) })
    const { username, code } = schema.parse(body)
    const url = process.env.DATABASE_URL
    if (!url) return new Response('DATABASE_URL not set', { status: 500 })
    const sql = neon(url)
    await sql`CREATE TABLE IF NOT EXISTS auth_users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username TEXT UNIQUE NOT NULL, pass_salt TEXT, pass_hash TEXT, failed_attempts INTEGER NOT NULL DEFAULT 0, locked_until TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`
    const saltBytes = new Uint8Array(16)
    crypto.getRandomValues(saltBytes)
    let saltStr = ''
    for (let i = 0; i < saltBytes.length; i++) saltStr += saltBytes[i].toString(16).padStart(2, '0')
    const hash = await hashCode(String(code), saltStr)
    await sql`INSERT INTO auth_users (username, pass_salt, pass_hash, failed_attempts, locked_until) VALUES (${username}, ${saltStr}, ${hash}, 0, NULL) ON CONFLICT (username) DO UPDATE SET pass_salt = EXCLUDED.pass_salt, pass_hash = EXCLUDED.pass_hash, failed_attempts = 0, locked_until = NULL`
    return Response.json({ ok: true })
  } catch (e: any) {
    if (e?.name === 'ZodError') return new Response('bad request', { status: 400 })
    return new Response(e?.message || 'error', { status: 500 })
  }
}

