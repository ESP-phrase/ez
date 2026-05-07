export async function POST(request: Request) {
  const url = "https://us.i.posthog.com/decide/";
  const res = await fetch(url, {
    method: "POST",
    headers: request.headers,
    body: await request.text(),
  });
  return new Response(res.body, { status: res.status, headers: res.headers });
}
