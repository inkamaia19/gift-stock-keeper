// Optional aggregator file is not needed on Vercel per-file routing.
// Keeping it as a small status endpoint to avoid collisions.
import { Hono } from 'hono'
import { handle } from 'hono/vercel'

export const runtime = 'edge'
const app = new Hono()

app.get('/', c => c.json({ ok: true, msg: 'API online' }))

app.onError((err, c) => {
  console.error('API error:', err)
  return c.text(err instanceof Error ? err.message : String(err), 500)
})

export default app
export const GET = handle(app)
