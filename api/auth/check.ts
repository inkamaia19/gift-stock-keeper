import { neon } from '@neondatabase/serverless'

export const runtime = 'edge'

export async function GET(req: Request) {
  try {
    const url = process.env.DATABASE_URL
    if (!url) return new Response('DATABASE_URL not set', { status: 500 })
    const sql = neon(url)

    const u = new URL(req.url)
    const username = (u.searchParams.get('username') || '').trim()
    if (!username) return Response.json({ exists: false })

    const rows = await sql`SELECT 1 FROM auth_users WHERE username = ${username} LIMIT 1`
    const exists = rows.length > 0
    return Response.json({ exists })
  } catch (e: any) {
    return new Response(e?.message || 'error', { status: 500 })
  }
}

