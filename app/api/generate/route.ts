export async function POST(req: Request) {
  const body = await req.json();

  // Directly using the backend URL as requested
  const backendUrl = "https://huggingface.co/spaces/Arsalan-joiya/DeNovoDrugDesign";

  const normalizedBackendUrl = normalizeHfSpacesUrl(backendUrl);

  const res = await fetch(`${normalizedBackendUrl.replace(/\/$/, "")}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  }).catch(err => {
    console.error("Fetch error to backend:", err);
    return new Response(JSON.stringify({ error: `Backend connection failed: ${err.message}` }), { status: 504 });
  });

  if (res instanceof Response && res.status >= 400) {
    const errorText = await res.text();
    return Response.json({ error: `Backend error ${res.status}: ${errorText}` }, { status: res.status });
  }

  // If res is still a standard fetch response (not our catch-wrap)
  const text = await (res as Response).text();
  console.log("RAW BACKEND RESPONSE:", text.substring(0, 500)); // Log first 500 chars
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text };
  }

  // Ensure data has the expected structure for the frontend
  if (data && !data.molecules && Array.isArray(data)) {
    // If backend returned a raw array instead of the {molecules: []} object
    data = {
      generated: data.length,
      drug_like: data.length,
      molecules: data.map((m: any) => ({
        smiles: m.sample || m.smiles || m.smi,
        score: m.score
      }))
    };
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
