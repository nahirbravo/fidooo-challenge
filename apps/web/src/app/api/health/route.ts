export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET(): Response {
  return Response.json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
  });
}
