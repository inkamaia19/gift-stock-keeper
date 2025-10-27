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
    console.error('API error /sales/[id] PUT:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}

export async function DELETE(req: Request) {
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
    console.error('API error /sales/[id] DELETE:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}

