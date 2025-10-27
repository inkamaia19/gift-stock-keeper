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
    const rows = await sql`SELECT * FROM sales ORDER BY date ASC`
    return Response.json(rows)
  } catch (err) {
    console.error('API error /sales GET:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!(await getUserFromRequest(req))) return new Response('unauthorized', { status: 401 })
  try {
    const body = await req.json()
    const { itemId, quantity, pricePerUnit, commissionAmount, date } = body || {}
    if (!itemId || !quantity || !pricePerUnit) return new Response('bad request', { status: 400 })

    const sql = getSql()
    await sql`BEGIN`
    try {
      const [item] = await sql`SELECT * FROM items WHERE id = ${itemId} FOR UPDATE`
      if (!item) throw new Error('item not found')
      if (item.type === 'product') {
        const current = (item.initial_stock ?? 0) - item.sold
        if (quantity > current) throw new Error(`only ${current} units available`)
        await sql`UPDATE items SET sold = sold + ${quantity} WHERE id = ${itemId}`
      }
      const total = quantity * pricePerUnit
      const [sale] = await sql`
        INSERT INTO sales (item_id, item_name, quantity, price_per_unit, total_amount, commission_amount, date)
        VALUES (${itemId}, ${item.name}, ${quantity}, ${pricePerUnit}, ${total}, ${commissionAmount || 0}, ${date || new Date().toISOString()})
        RETURNING *
      `
      await sql`COMMIT`
      return Response.json(sale, { status: 201 })
    } catch (inner) {
      await sql`ROLLBACK`
      throw inner
    }
  } catch (err) {
    console.error('API error /sales POST:', err)
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
    const sql = getSql()
    const [row] = await sql`
      UPDATE sales
      SET quantity = COALESCE(${body.quantity}, quantity),
          price_per_unit = COALESCE(${body.pricePerUnit}, price_per_unit),
          total_amount = COALESCE(${body.totalAmount}, total_amount),
          commission_amount = COALESCE(${body.commissionAmount}, commission_amount),
          date = COALESCE(${body.date}, date)
      WHERE id = ${id}
      RETURNING *
    `
    if (!row) return new Response('not found', { status: 404 })
    return Response.json(row)
  } catch (err) {
    console.error('API error /sales PUT:', err)
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
    await sql`BEGIN`
    try {
      const [sale] = await sql`SELECT * FROM sales WHERE id = ${id} FOR UPDATE`
      if (!sale) {
        await sql`ROLLBACK`
        return new Response('not found', { status: 404 })
      }
      const [item] = await sql`SELECT * FROM items WHERE id = ${sale.item_id} FOR UPDATE`
      if (item && item.type === 'product') {
        await sql`UPDATE items SET sold = GREATEST(0, sold - ${sale.quantity}) WHERE id = ${item.id}`
      }
      await sql`DELETE FROM sales WHERE id = ${id}`
      await sql`COMMIT`
      return Response.json({ ok: true })
    } catch (inner) {
      await sql`ROLLBACK`
      throw inner
    }
  } catch (err) {
    console.error('API error /sales DELETE:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}
