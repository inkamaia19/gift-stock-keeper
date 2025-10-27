import { neon } from '@neondatabase/serverless'

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

// Firma mínima de sesión (HS256) sin depender de utilidades externas
async function hmacSha256(key: Uint8Array, data: Uint8Array) {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return crypto.subtle.sign('HMAC', k, data)
}

function b64urlStr(buf: ArrayBuffer | Uint8Array) {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i])
  return btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

async function signSession(payload: object, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const enc = new TextEncoder()
  const head = b64urlStr(enc.encode(JSON.stringify(header)))
  const body = b64urlStr(enc.encode(JSON.stringify(payload)))
  const toSign = enc.encode(`${head}.${body}`)
  const sig = await hmacSha256(enc.encode(secret), toSign)
  return `${head}.${body}.${b64urlStr(sig)}`
}

export async function POST(req: Request) {
  try {
    const { username, code } = await req.json()
    if (!username || !code) return new Response('bad request', { status: 400 })
    if (!/^\d{6}$/.test(String(code))) return new Response('invalid code', { status: 400 })
    const url = process.env.DATABASE_URL
    if (!url) return new Response('DATABASE_URL not set', { status: 500 })
    const sql = neon(url)
    await sql`CREATE TABLE IF NOT EXISTS auth_users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), username TEXT UNIQUE NOT NULL, pass_salt TEXT, pass_hash TEXT, failed_attempts INTEGER NOT NULL DEFAULT 0, locked_until TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`
    const rows = await sql`SELECT * FROM auth_users WHERE username = ${username} LIMIT 1`
    if (rows.length === 0) return new Response('user not found', { status: 404 })
    const user = rows[0] as any
    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      return new Response('account locked', { status: 403 })
    }
    if (!user.pass_salt || !user.pass_hash) return new Response('password not set', { status: 400 })
    const calc = await hashCode(String(code), String(user.pass_salt))
    if (calc !== user.pass_hash) {
      const attempts = (user.failed_attempts ?? 0) + 1
      if (attempts >= 2) {
        const lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString()
        await sql`UPDATE auth_users SET failed_attempts = ${attempts}, locked_until = ${lockedUntil} WHERE username = ${username}`
        return new Response('account locked', { status: 403 })
      } else {
        await sql`UPDATE auth_users SET failed_attempts = ${attempts} WHERE username = ${username}`
        return new Response('invalid credentials', { status: 401 })
      }
    }
    // success
    await sql`UPDATE auth_users SET failed_attempts = 0, locked_until = NULL WHERE username = ${username}`
    const sessionSecret = process.env.SESSION_SECRET || 'dev-secret'
    const token = await signSession({ sub: username, exp: Math.floor(Date.now()/1000) + 60*60*24*7 }, sessionSecret)
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Set-Cookie': `session=${token}; Path=/; HttpOnly; SameSite=Lax` }
    })
  } catch (e: any) {
    return new Response(e?.message || 'error', { status: 500 })
  }
}
