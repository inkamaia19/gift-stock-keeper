import { neon } from '@neondatabase/serverless'

export const runtime = 'edge'

export async function GET() {
  try {
    const url = process.env.DATABASE_URL
    if (!url) return new Response('DATABASE_URL not set', { status: 500 })
    const sql = neon(url)
    const [now] = await sql`SELECT now()`
    const [itemsReg] = await sql`SELECT to_regclass('public.items') AS items`
    const [salesReg] = await sql`SELECT to_regclass('public.sales') AS sales`
    return Response.json({ ok: true, now: now?.now, items: itemsReg?.items, sales: salesReg?.sales })
  } catch (err) {
    return new Response(String(err instanceof Error ? err.message : err), { status: 500 })
  }
}
