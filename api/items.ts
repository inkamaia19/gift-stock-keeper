import { neon } from '@neondatabase/serverless'
import { z } from 'zod'
import { getUserFromRequest } from './_auth.ts'
import { ensureOwnershipSchema } from './_db.ts'

export const runtime = 'edge'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

export async function GET(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return new Response('unauthorized', { status: 401 })
  try {
    await ensureOwnershipSchema()
    const sql = getSql()
    const rows = await sql`SELECT * FROM items WHERE COALESCE(owner_username, owner) = ${user} ORDER BY name ASC`
    return Response.json(rows)
  } catch (err) {
    console.error('API error /items GET:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}

export async function POST(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return new Response('unauthorized', { status: 401 })
  try {
    const body = await req.json()
    const schema = z.object({
      name: z.string().trim().min(1, 'name required'),
      type: z.enum(['product','service']),
      imageUrl: z.string().url().optional().or(z.literal('').transform(()=>undefined)),
      initialStock: z.number().int().min(0).optional()
    })
    const parsed = schema.parse(body)
    const { name, type, imageUrl } = parsed
    const init = type === 'product' ? Number(parsed.initialStock ?? 0) : null
    await ensureOwnershipSchema()
    const sql = getSql()
    const [row] = await sql`
      INSERT INTO items (name, type, image_url, initial_stock, sold, owner, owner_username)
      VALUES (${name.trim()}, ${type}, ${imageUrl || null}, ${init}, 0, ${user}, ${user})
      RETURNING *
    `
    return Response.json(row, { status: 201 })
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return new Response(err.errors?.map((x:any)=>x.message).join(', ') || 'bad request', { status: 400 })
    }
    console.error('API error /items POST:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}

export async function PUT(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) return new Response('unauthorized', { status: 401 })
  try {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()
    if (!id) return new Response('id required', { status: 400 })
    const body = await req.json()
    const sql = getSql()
    const [row] = await sql`
      UPDATE items
      SET name = COALESCE(${body.name}, name),
          image_url = COALESCE(${body.imageUrl}, image_url),
          initial_stock = COALESCE(${body.initialStock}, initial_stock)
      WHERE id = ${id} AND COALESCE(owner_username, owner) = ${user}
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
  const user = await getUserFromRequest(req)
  if (!user) return new Response('unauthorized', { status: 401 })
  try {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()
    if (!id) return new Response('id required', { status: 400 })
    const sql = getSql()
    const [{ count }] = await sql`SELECT COUNT(*)::int FROM sales WHERE item_id = ${id} AND COALESCE(owner_username, owner) = ${user}`
    if (count > 0) return new Response('has sales', { status: 409 })
    const [row] = await sql`DELETE FROM items WHERE id = ${id} AND COALESCE(owner_username, owner) = ${user} RETURNING *`
    if (!row) return new Response('not found', { status: 404 })
    return Response.json({ ok: true })
  } catch (err) {
    console.error('API error /items DELETE:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}
