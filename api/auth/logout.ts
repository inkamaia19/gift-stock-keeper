export const runtime = 'edge'

export async function POST() {
  // Clear cookie by setting expired date
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax'
    }
  })
}

