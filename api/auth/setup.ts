import { neon } from '@neondatabase/serverless'
import { z } from 'zod'
import { ensureAuthSchema } from '../_db'

export const runtime = 'edge'

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
  try {
    const body = await req.json()
    const schema = z.object({
      username: z.string().trim().min(1, 'username required'),
      code: z.string().regex(/^\d{6}$/, 'invalid code'),
      adminToken: z.string().min(1, 'admin token required')
    })
    const { username, code, adminToken } = schema.parse(body)
    if ((process.env.ADMIN_SETUP_TOKEN || '') !== String(adminToken || '')) return new Response('forbidden', { status: 403 })
    const url = process.env.DATABASE_URL
    if (!url) return new Response('DATABASE_URL not set', { status: 500 })
    const sql = neon(url)
    try { await ensureAuthSchema() } catch (_) { /* ignore */ }
    // generate salt
    const saltBytes = new Uint8Array(16)
    crypto.getRandomValues(saltBytes)
    let saltStr = ''
    for (let i = 0; i < saltBytes.length; i++) saltStr += saltBytes[i].toString(16).padStart(2, '0')
    const hash = await hashCode(String(code), saltStr)
    await sql`INSERT INTO auth_users (username, pass_salt, pass_hash, failed_attempts, locked_until) VALUES (${username}, ${saltStr}, ${hash}, 0, NULL) ON CONFLICT (username) DO UPDATE SET pass_salt = EXCLUDED.pass_salt, pass_hash = EXCLUDED.pass_hash, failed_attempts = 0, locked_until = NULL`
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return new Response(e.errors?.map((x:any)=>x.message).join(', ') || 'bad request', { status: 400 })
    }
    return new Response(e?.message || 'error', { status: 500 })
  }
}
