import { neon } from '@neondatabase/serverless'
import { getUserFromRequest } from './_auth'

export const runtime = 'edge'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

export async function GET(req: Request) {
  if (!(await getUserFromRequest(req))) return new Response('unauthorized', { status: 401 })
  try {
    const sql = getSql()
    const rows = await sql`SELECT * FROM items ORDER BY name ASC`
    return Response.json(rows)
  } catch (err) {
    console.error('API error /items GET:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!(await getUserFromRequest(req))) return new Response('unauthorized', { status: 401 })
  try {
    const body = await req.json()
    const { name, type, imageUrl, initialStock } = body || {}
    if (!name || !String(name).trim()) return new Response('name required', { status: 400 })
    if (!['product','service'].includes(type)) return new Response('invalid type', { status: 400 })
    const init = type === 'product' ? Number(initialStock) || 0 : null
    const sql = getSql()
    const [row] = await sql`
      INSERT INTO items (name, type, image_url, initial_stock, sold)
      VALUES (${name.trim()}, ${type}, ${imageUrl || null}, ${init}, 0)
      RETURNING *
    `
    return Response.json(row, { status: 201 })
  } catch (err) {
    console.error('API error /items POST:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}

export async function PUT(req: Request) {
  if (!(await getUserFromRequest(req))) return new Response('unauthorized', { status: 401 })
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
    console.error('API error /items PUT:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}

export async function DELETE(req: Request) {
  if (!(await getUserFromRequest(req))) return new Response('unauthorized', { status: 401 })
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
    console.error('API error /items DELETE:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}
