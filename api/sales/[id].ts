import { neon } from '@neondatabase/serverless'
import { getUserFromRequest } from '../_auth.ts'
import { z } from 'zod'

export const runtime = 'edge'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

export async function PUT(req: Request) {
  if (!(await getUserFromRequest(req))) return new Response('unauthorized', { status: 401 })
  try {
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop()
    if (!id) return new Response('id required', { status: 400 })
    const body = await req.json()
    const schema = z.object({
      quantity: z.number().int().positive().optional(),
      pricePerUnit: z.number().positive().optional(),
      totalAmount: z.number().positive().optional(),
      commissionAmount: z.number().min(0).optional(),
      date: z.string().datetime().optional(),
    })
    const parsed = schema.parse(body)
    const sql = getSql()
    const [row] = await sql`
      UPDATE sales
      SET quantity = COALESCE(${parsed.quantity}, quantity),
          price_per_unit = COALESCE(${parsed.pricePerUnit}, price_per_unit),
          total_amount = COALESCE(${parsed.totalAmount}, total_amount),
          commission_amount = COALESCE(${parsed.commissionAmount}, commission_amount),
          date = COALESCE(${parsed.date}, date)
      WHERE id = ${id}
      RETURNING *
    `
    if (!row) return new Response('not found', { status: 404 })
    return Response.json(row)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return new Response(err.errors?.map((x:any)=>x.message).join(', ') || 'bad request', { status: 400 })
    }
    console.error('API error /sales/[id] PUT:', err)
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
    console.error('API error /sales/[id] DELETE:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}
