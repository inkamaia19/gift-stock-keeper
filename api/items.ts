import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { sql } from './_db'

export const runtime = 'edge'
const app = new Hono()

app.get('/', async c => {
  const rows = await sql`SELECT * FROM items ORDER BY name ASC`
  return c.json(rows)
})

app.post('/', async c => {
  const body = await c.req.json()
  const { name, type, imageUrl, initialStock } = body
  if (!name || !String(name).trim()) return c.text('name required', 400)
  if (!['product','service'].includes(type)) return c.text('invalid type', 400)
  const init = type === 'product' ? Number(initialStock) || 0 : null
  const [row] = await sql`
    INSERT INTO items (name, type, image_url, initial_stock, sold)
    VALUES (${name.trim()}, ${type}, ${imageUrl || null}, ${init}, 0)
    RETURNING *
  `
  return c.json(row, 201)
})

app.put('/:id', async c => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { name, imageUrl, initialStock } = body
  const [row] = await sql`
    UPDATE items
    SET name = COALESCE(${name}, name),
        image_url = COALESCE(${imageUrl}, image_url),
        initial_stock = COALESCE(${initialStock}, initial_stock)
    WHERE id = ${id}
    RETURNING *
  `
  if (!row) return c.text('not found', 404)
  return c.json(row)
})

app.delete('/:id', async c => {
  const id = c.req.param('id')
  const [{ count }] = await sql`SELECT COUNT(*)::int FROM sales WHERE item_id = ${id}`
  if (count > 0) return c.text('has sales', 409)
  const [row] = await sql`DELETE FROM items WHERE id = ${id} RETURNING *`
  if (!row) return c.text('not found', 404)
  return c.json({ ok: true })
})

export default app
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
