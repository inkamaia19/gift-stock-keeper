import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL as string)

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

