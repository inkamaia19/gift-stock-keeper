import { Hono } from 'hono'
import { sql, withTx } from '../_db'

const app = new Hono()

app.post('/', async c => {
  const body = await c.req.json()
  const { items, finalPrice, commissionAmount, date } = body
  if (!Array.isArray(items) || items.length === 0) return c.text('bad request', 400)

  const totalQty = items.reduce((s: number, it: any) => s + (it.quantity || 0), 0) || 1
  const bundleId = crypto.randomUUID()

  await withTx(async exec => {
    for (const it of items) {
      const [item] = await exec`SELECT * FROM items WHERE id = ${it.itemId} FOR UPDATE`
      if (!item) throw new Error('item not found')
      if (item.type === 'product') {
        const current = (item.initial_stock ?? 0) - item.sold
        if (it.quantity > current) throw new Error(`only ${current} units available for ${item.name}`)
        await exec`UPDATE items SET sold = sold + ${it.quantity} WHERE id = ${it.itemId}`
      }
      const proportion = it.quantity / totalQty
      const proportionalPrice = Number(finalPrice) * proportion
      const proportionalCommission = Number(commissionAmount || 0) * proportion
      const ppu = it.quantity > 0 ? proportionalPrice / it.quantity : 0
      await exec`
        INSERT INTO sales (item_id, item_name, quantity, price_per_unit, total_amount, commission_amount, date, bundle_id)
        VALUES (${it.itemId}, ${item.name}, ${it.quantity}, ${ppu}, ${proportionalPrice}, ${proportionalCommission}, ${date || new Date().toISOString()}, ${bundleId})
      `
    }
  })

  return c.json({ ok: true, bundleId })
})

export default app

