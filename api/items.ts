import { neon } from '@neondatabase/serverless'
import { z } from 'zod'
import { getUserFromRequest } from './_auth.ts'

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
    const rows = await sql`SELECT * FROM items ORDER BY name ASC`
    return Response.json(rows)
  } catch (err) {
    console.error('API error /items GET:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!(await getUserFromRequest(req))) return new Response('unauthorized', { status: 401 })
  try {
    const body = await req.json()
    const schema = z.object({
      name: z.string().trim().min(1, 'name required'),
      type: z.enum(['product','service']),
      imageUrl: z.string().url().optional().or(z.literal('').transform(()=>undefined)),
      initialStock: z.number().int().min(0).optional()
    })
    const parsed = schema.parse(body)
    const { name, type, imageUrl } = parsed
    const init = type === 'product' ? Number(parsed.initialStock ?? 0) : null
    const sql = getSql()
    const [row] = await sql`
      INSERT INTO items (name, type, image_url, initial_stock, sold)
      VALUES (${name.trim()}, ${type}, ${imageUrl || null}, ${init}, 0)
      RETURNING *
    `
    return Response.json(row, { status: 201 })
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return new Response(err.errors?.map((x:any)=>x.message).join(', ') || 'bad request', { status: 400 })
    }
    console.error('API error /items POST:', err)
    return new Response(err instanceof Error ? err.message : String(err), { status: 500 })
  }
}

export async function PUT(req: Request) {
  return new Response('Method Not Allowed', { status: 405 })
}

export async function DELETE(req: Request) {
  return new Response('Method Not Allowed', { status: 405 })
}
