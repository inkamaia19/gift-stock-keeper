import { neon } from '@neondatabase/serverless'
import { signSession } from '../_auth'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    if ((process.env.ALLOW_ENROLL || '').toLowerCase() !== 'true') {
      return new Response('enroll disabled', { status: 403 })
    }
    const { username } = await req.json()
    if (!username || typeof username !== 'string') return new Response('username required', { status: 400 })
    const url = process.env.DATABASE_URL
    if (!url) return new Response('DATABASE_URL not set', { status: 500 })
    const sql = neon(url)
    await sql`CREATE TABLE IF NOT EXISTS auth_users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username TEXT UNIQUE NOT NULL, secret TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`
    // generate base32 secret (random 20 bytes)
    const bytes = new Uint8Array(20)
    crypto.getRandomValues(bytes)
    const b32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let bits = ''
    for (let i = 0; i < bytes.length; i++) bits += bytes[i].toString(2).padStart(8, '0')
    let out = ''
    for (let i = 0; i < bits.length; i += 5) {
      const chunk = bits.slice(i, i + 5)
      if (chunk.length < 5) break
      out += b32[parseInt(chunk, 2)]
    }
    const secret = out
    const issuer = 'Gift Stock Keeper'
    const account = encodeURIComponent(username)
    const otpauthUrl = `otpauth://totp/${issuer}:${account}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&digits=6&period=30`
    await sql`INSERT INTO auth_users (username, secret) VALUES (${username}, ${secret}) ON CONFLICT (username) DO UPDATE SET secret = EXCLUDED.secret`
    // provisional session to allow viewing the secret page if needed
    const sessionSecret = process.env.SESSION_SECRET || 'dev-secret'
    const token = await signSession({ sub: username, exp: Math.floor(Date.now()/1000) + 300 }, sessionSecret)
    return new Response(JSON.stringify({ ok: true, username, secret, otpauthUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': `session=${token}; Path=/; HttpOnly; SameSite=Lax` }
    })
  } catch (e: any) {
    return new Response(e?.message || 'error', { status: 500 })
  }
}
