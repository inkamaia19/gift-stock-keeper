import { neon } from '@neondatabase/serverless'

export const runtime = 'edge'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()
    if (!id) return new Response('id required', { status: 400 })
    const body = await req.json()
    const { name, imageUrl, initialStock } = body || {}
    const sql = getSql()
    const [row] = await sql`
      UPDATE items
      SET name = COALESCE(${name}, name),
          image_url = COALESCE(${imageUrl}, image_url),
          initial_stock = COALESCE(${initialStock}, initial_stock)
      WHERE id = ${id}
      RETURNING *
    `
    if (!row) return new Response('not found', { status: 404 })
    return Response.json(row)
  } catch (err) {
    console.error('API error /items/[id] PUT:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()
    if (!id) return new Response('id required', { status: 400 })
    const sql = getSql()
    const [{ count }] = await sql`SELECT COUNT(*)::int FROM sales WHERE item_id = ${id}`
    if (count > 0) return new Response('has sales', { status: 409 })
    const [row] = await sql`DELETE FROM items WHERE id = ${id} RETURNING *`
    if (!row) return new Response('not found', { status: 404 })
    return Response.json({ ok: true })
  } catch (err) {
    console.error('API error /items/[id] DELETE:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}

