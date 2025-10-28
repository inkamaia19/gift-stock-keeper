export const runtime = 'edge'

import { verifySession } from './_auth.ts'

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || ''
    const match = /(?:^|; )session=([^;]+)/.exec(cookie)
    const token = match ? decodeURIComponent(match[1]) : null
    const secret = process.env.SESSION_SECRET || 'dev-secret'
    const payload = await verifySession(token, secret)
    if (!payload) return json({ authenticated: false })
    return json({ authenticated: true, user: { username: payload.sub } })
  } catch {
    return json({ authenticated: false })
  }
}

function json(obj: any) {
  return new Response(JSON.stringify(obj), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
