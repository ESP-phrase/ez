export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  const url = `https://us-assets.i.posthog.com/static/${path}`;
  const res = await fetch(url, { headers: request.headers });
  return new Response(res.body, { status: res.status, headers: res.headers });
}
