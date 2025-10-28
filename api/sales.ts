import { neon } from '@neondatabase/serverless'
import { getUserFromRequest } from './_auth.ts'
import { z } from 'zod'

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
    const schema = z.object({
      itemId: z.string().uuid(),
      quantity: z.number().int().positive(),
      pricePerUnit: z.number().positive(),
      commissionAmount: z.number().min(0).optional(),
      date: z.string().datetime().optional()
    })
    const { itemId, quantity, pricePerUnit, commissionAmount, date } = schema.parse(body)

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
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return new Response(err.errors?.map((x:any)=>x.message).join(', ') || 'bad request', { status: 400 })
    }
    console.error('API error /sales POST:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}

export async function PUT(req: Request) {
  return new Response('Method Not Allowed', { status: 405 })
}

export async function DELETE(req: Request) {
  return new Response('Method Not Allowed', { status: 405 })
}
