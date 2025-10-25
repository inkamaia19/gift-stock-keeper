import { neon } from '@neondatabase/serverless'

const url = process.env.DATABASE_URL
if (!url) {
  throw new Error('DATABASE_URL is not set. Define it in your environment (.env.local for vercel dev or project settings in Vercel).')
}

export const sql = neon(url)

export async function withTx<T>(fn: (exec: typeof sql) => Promise<T>) {
  await sql`BEGIN`
  try {
    const res = await fn(sql)
    await sql`COMMIT`
    return res
  } catch (err) {
    await sql`ROLLBACK`
    throw err
  }
}
