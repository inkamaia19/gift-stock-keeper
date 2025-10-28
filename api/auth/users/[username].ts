import { neon } from '@neondatabase/serverless'
import { getUserFromRequest } from '../../_auth.ts'
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

export async function PUT(req: Request) {
  // Change code for given user (admin only)
  const caller = await getUserFromRequest(req)
  if (!isAdmin(caller)) return new Response('forbidden', { status: 403 })
  try {
    const u = new URL(req.url)
    const usernameParam = u.pathname.split('/').pop() || ''
    const body = await req.json()
    const schema = z.object({ code: z.string().regex(/^\d{6}$/) })
    const { code } = schema.parse(body)
    const url = process.env.DATABASE_URL
    if (!url) return new Response('DATABASE_URL not set', { status: 500 })
    const sql = neon(url)
    // Ensure table exists without requiring pgcrypto
    try {
      await sql`CREATE TABLE IF NOT EXISTS auth_users (id UUID PRIMARY KEY, username TEXT UNIQUE NOT NULL, pass_salt TEXT, pass_hash TEXT, failed_attempts INTEGER NOT NULL DEFAULT 0, locked_until TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`
    } catch (_) { /* ignore */ }
    const saltBytes = new Uint8Array(16)
    crypto.getRandomValues(saltBytes)
    let saltStr = ''
    for (let i = 0; i < saltBytes.length; i++) saltStr += saltBytes[i].toString(16).padStart(2, '0')
    const hash = await hashCode(String(code), saltStr)
    const rows = await sql`UPDATE auth_users SET pass_salt=${saltStr}, pass_hash=${hash}, failed_attempts=0, locked_until=NULL WHERE username=${usernameParam} RETURNING id`
    if (rows.length === 0) return new Response('user not found', { status: 404 })
    return Response.json({ ok: true })
  } catch (e: any) {
    if (e?.name === 'ZodError') return new Response('bad request', { status: 400 })
    return new Response(e?.message || 'error', { status: 500 })
  }
}
