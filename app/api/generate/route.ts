export async function POST(req: Request) {
  const body = await req.json();

  const backendUrl = process.env.HF_BACKEND_URL;
  if (!backendUrl) {
    return Response.json(
      { error: "HF_BACKEND_URL is not set" },
      { status: 500 }
    );
  }

  const res = await fetch(`${backendUrl.replace(/\/$/, "")}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text };
  }

  return Response.json(data, { status: res.status });
}
