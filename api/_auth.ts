// Helpers for signed session cookies (Edge-compatible)
export const runtime = 'edge'

// Minimal signed token (HMAC-SHA256) as session cookie
async function hmacSha256(key: Uint8Array, data: Uint8Array) {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return crypto.subtle.sign('HMAC', k, data)
}

function b64url(buf: ArrayBuffer | Uint8Array) {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i])
  return btoa(s).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export async function signSession(payload: object, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const enc = new TextEncoder()
  const head = b64url(enc.encode(JSON.stringify(header)))
  const body = b64url(enc.encode(JSON.stringify(payload)))
  const toSign = enc.encode(`${head}.${body}`)
  const sig = await hmacSha256(enc.encode(secret), toSign)
  return `${head}.${body}.${b64url(sig)}`
}

export async function verifySession(token: string | null | undefined, secret: string): Promise<any | null> {
  if (!token) return null
  const enc = new TextEncoder()
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [, payload, sig] = parts
  const toSign = enc.encode(`${parts[0]}.${payload}`)
  const expected = await hmacSha256(enc.encode(secret), toSign)
  if (b64url(expected) !== sig) return null
  try {
    const json = JSON.parse(new TextDecoder().decode(b64urlToBytes(payload)))
    if (json.exp && Date.now() / 1000 > json.exp) return null
    return json
  } catch {
    return null
  }
}

export async function getUserFromRequest(req: Request): Promise<string | null> {
  const cookie = req.headers.get('cookie') || ''
  const m = /(?:^|; )session=([^;]+)/.exec(cookie)
  const token = m ? decodeURIComponent(m[1]) : null
  const secret = process.env.SESSION_SECRET || 'dev-secret'
  const payload = await verifySession(token, secret)
  return payload?.sub ?? null
}

// Base64url decode to Uint8Array without relying on global atob
function b64urlToBytes(input: string): Uint8Array {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4)
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const out: number[] = []
  let buffer = 0
  let bits = 0
  for (let i = 0; i < base64.length; i++) {
    const c = base64[i]
    if (c === '=') break
    const val = alphabet.indexOf(c)
    if (val < 0) continue
    buffer = (buffer << 6) | val
    bits += 6
    if (bits >= 8) {
      bits -= 8
      out.push((buffer >> bits) & 0xff)
    }
  }
  return new Uint8Array(out)
}
