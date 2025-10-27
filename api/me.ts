export const runtime = 'edge'

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || ''
    const match = /(?:^|; )session=([^;]+)/.exec(cookie)
    const token = match ? decodeURIComponent(match[1]) : null
    if (!token) return json({ authenticated: false })
    const parts = token.split('.')
    if (parts.length !== 3) return json({ authenticated: false })
    // Decode payload safely (no signature verification here; endpoints protegen con verificación completa)
    const payloadRaw = b64urlToBytes(parts[1])
    const payload = JSON.parse(new TextDecoder().decode(payloadRaw))
    if (payload.exp && Date.now() / 1000 > payload.exp) return json({ authenticated: false })
    return json({ authenticated: true, user: { username: payload.sub } })
  } catch (e: any) {
    return json({ authenticated: false })
  }
}

function json(obj: any) {
  return new Response(JSON.stringify(obj), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

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
