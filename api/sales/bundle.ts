import { neon } from '@neondatabase/serverless'
import { getUserFromRequest } from '../_auth'

export const runtime = 'edge'

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  return neon(url)
}

export async function POST(req: Request) {
  if (!(await getUserFromRequest(req))) return new Response('unauthorized', { status: 401 })
  try {
    const body = await req.json()
    const { items, finalPrice, commissionAmount, date } = body || {}
    if (!Array.isArray(items) || items.length === 0) return new Response('bad request', { status: 400 })

    const totalQty = items.reduce((s: number, it: any) => s + (it.quantity || 0), 0) || 1
    const bundleId = crypto.randomUUID()
    const sql = getSql()

    await sql`BEGIN`
    try {
      for (const it of items) {
        const [item] = await sql`SELECT * FROM items WHERE id = ${it.itemId} FOR UPDATE`
        if (!item) throw new Error('item not found')
        if (item.type === 'product') {
          const current = (item.initial_stock ?? 0) - item.sold
          if (it.quantity > current) throw new Error(`only ${current} units available for ${item.name}`)
          await sql`UPDATE items SET sold = sold + ${it.quantity} WHERE id = ${it.itemId}`
        }
        const proportion = it.quantity / totalQty
        const proportionalPrice = Number(finalPrice) * proportion
        const proportionalCommission = Number(commissionAmount || 0) * proportion
        const ppu = it.quantity > 0 ? proportionalPrice / it.quantity : 0
        await sql`
          INSERT INTO sales (item_id, item_name, quantity, price_per_unit, total_amount, commission_amount, date, bundle_id)
          VALUES (${it.itemId}, ${item.name}, ${it.quantity}, ${ppu}, ${proportionalPrice}, ${proportionalCommission}, ${date || new Date().toISOString()}, ${bundleId})
        `
      }
      await sql`COMMIT`
      return Response.json({ ok: true, bundleId })
    } catch (inner) {
      await sql`ROLLBACK`
      throw inner
    }
  } catch (err) {
    console.error('API error /sales/bundle POST:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}
