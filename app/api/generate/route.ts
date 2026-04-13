export async function POST(req: Request) {
  const body = await req.json();

  const backendUrl = process.env.HF_BACKEND_URL;
  if (!backendUrl) {
    return Response.json(
      { error: "HF_BACKEND_URL is not set" },
      { status: 500 }
    );
  }

  const normalizedBackendUrl = normalizeHfSpacesUrl(backendUrl);

  const res = await fetch(`${normalizedBackendUrl.replace(/\/$/, "")}/generate`, {
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

function normalizeHfSpacesUrl(input: string): string {
  const trimmed = input.trim().replace(/\/$/, "");

  const repoMatch = trimmed.match(
    /^https?:\/\/huggingface\.co\/spaces\/([^/]+)\/([^/]+)$/i
  );
  if (repoMatch) {
    const owner = repoMatch[1];
    const space = repoMatch[2];
    return `https://${owner}-${space}.hf.space`;
  }

  return trimmed;
}
