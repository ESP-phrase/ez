export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  const url = `https://us.i.posthog.com/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: request.headers,
    body: await request.text(),
  });
  return new Response(res.body, { status: res.status, headers: res.headers });
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  const searchParams = new URL(request.url).searchParams.toString();
  const url = `https://us.i.posthog.com/${path}${searchParams ? `?${searchParams}` : ""}`;
  const res = await fetch(url, { headers: request.headers });
  return new Response(res.body, { status: res.status, headers: res.headers });
}
