import { Hono } from 'hono'
import { sql, withTx } from './_db'

const app = new Hono()

app.get('/', async c => {
  const rows = await sql`SELECT * FROM sales ORDER BY date ASC`
  return c.json(rows)
})

app.post('/', async c => {
  const body = await c.req.json()
  const { itemId, quantity, pricePerUnit, commissionAmount, date } = body
  if (!itemId || !quantity || !pricePerUnit) return c.text('bad request', 400)

  const result = await withTx(async exec => {
    const [item] = await exec`SELECT * FROM items WHERE id = ${itemId} FOR UPDATE`
    if (!item) throw new Error('item not found')
    if (item.type === 'product') {
      const current = (item.initial_stock ?? 0) - item.sold
      if (quantity > current) throw new Error(`only ${current} units available`)
      await exec`UPDATE items SET sold = sold + ${quantity} WHERE id = ${itemId}`
    }
    const total = quantity * pricePerUnit
    const [sale] = await exec`
      INSERT INTO sales (item_id, item_name, quantity, price_per_unit, total_amount, commission_amount, date)
      VALUES (${itemId}, ${item.name}, ${quantity}, ${pricePerUnit}, ${total}, ${commissionAmount || 0}, ${date || new Date().toISOString()})
      RETURNING *
    `
    return sale
  })

  return c.json(result, 201)
})

app.put('/:id', async c => {
  const id = c.req.param('id')
  const body = await c.req.json()
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
  if (!row) return c.text('not found', 404)
  return c.json(row)
})

app.delete('/:id', async c => {
  const id = c.req.param('id')
  const result = await withTx(async exec => {
    const [sale] = await exec`SELECT * FROM sales WHERE id = ${id} FOR UPDATE`
    if (!sale) return { ok: false }
    const [item] = await exec`SELECT * FROM items WHERE id = ${sale.item_id} FOR UPDATE`
    if (item && item.type === 'product') {
      await exec`UPDATE items SET sold = GREATEST(0, sold - ${sale.quantity}) WHERE id = ${item.id}`
    }
    await exec`DELETE FROM sales WHERE id = ${id}`
    return { ok: true }
  })
  if (!result.ok) return c.text('not found', 404)
  return c.json({ ok: true })
})

export default app

