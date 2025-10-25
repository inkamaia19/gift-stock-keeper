import { Hono } from 'hono'
import items from './items'
import sales from './sales'
import bundle from './sales/bundle'

const app = new Hono()

app.route('/items', items)
app.route('/sales', sales)
app.route('/sales/bundle', bundle)

// Better error surface for debugging 500s locally
app.onError((err, c) => {
  console.error('API error:', err)
  return c.text(err instanceof Error ? err.message : String(err), 500)
})

export default app
