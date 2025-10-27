// Minimal status endpoint for `/api`.
// Use a direct Edge handler to avoid any router mismatches.
export const runtime = 'edge'

export function GET() {
  return Response.json({ ok: true, msg: 'API online' })
}
