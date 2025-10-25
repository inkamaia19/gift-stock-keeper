import { Hono } from 'hono'
import items from './items'
import sales from './sales'
import bundle from './sales/bundle'

const app = new Hono()

app.route('/items', items)
app.route('/sales', sales)
app.route('/sales/bundle', bundle)

export default app

