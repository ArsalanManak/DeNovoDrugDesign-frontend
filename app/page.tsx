"use client";

import { useState } from "react";

type GenerateResponse = {
  generated: number;
  drug_like: number;
  molecules: Array<{ smiles: string }>;
  raw?: unknown;
  detail?: string;
  error?: string;
};

export default function Home() {
  const [smiles, setSmiles] = useState("");
  const [numMolecules, setNumMolecules] = useState(10);
  const [results, setResults] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ smiles, num_molecules: numMolecules }),
      });
      const data = (await res.json()) as GenerateResponse;
      setResults(data);
    } catch (err) {
      setResults({
        generated: 0,
        drug_like: 0,
        molecules: [],
        error: "Failed to connect to the generation service.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      {/* Header / Hero */}
      <header className="border-b border-zinc-200 bg-white py-12 dark:border-zinc-800 dark:bg-black">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="text-4xl font-bold tracking-tight">
            De-Novo Molecular Generator
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Generative AI for Molecular Optimization using NVIDIA MolMIM & Lipinski Rules.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Sidebar: Technical Details */}
          <div className="md:col-span-1">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
              Technical Architecture
            </h2>
            <div className="mt-6 flex flex-col gap-6">
              <section>
                <h3 className="text-sm font-semibold">Generative Engine</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Utilizes **NVIDIA MolMIM**, a Controlled Latent Space Molecular Generation model. 
                  It performs molecular optimization through iterative latent space traversal.
                </p>
              </section>
              <section>
                <h3 className="text-sm font-semibold">Validation Layer</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Integrated with **RDKit** to enforce **Lipinski's Rule of Five**, ensuring generated 
                  candidates maintain oral bioavailability profile.
                </p>
              </section>
              <section>
                <h3 className="text-sm font-semibold">Deployment</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Cloud-native pipeline: **Next.js** (Vercel) + **FastAPI** (HuggingFace Spaces) 
                  linked via a secure API proxy.
                </p>
              </section>
            </div>
          </div>

          {/* Main Content: Input & Results */}
          <div className="md:col-span-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium">Seed SMILES</label>
                  <input
                    value={smiles}
                    onChange={(e) => setSmiles(e.target.value)}
                    placeholder="e.g. CC(=O)Oc1ccccc1C(=O)O"
                    className="mt-1.5 h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-black"
                  />
                </div>

                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Batch Size</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={numMolecules}
                      onChange={(e) => setNumMolecules(Number(e.target.value))}
                      className="mt-1.5 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-black"
                    />
                  </div>
                  <button
                    onClick={generate}
                    disabled={loading || !smiles.trim()}
                    className="h-10 rounded-lg bg-blue-600 px-6 font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? "Optimizing..." : "Generate Candidates"}
                  </button>
                </div>
              </div>

              {/* Results */}
              {results && (
                <div className="mt-10 border-t border-zinc-100 pt-8 dark:border-zinc-900">
                  {results.detail || results.error ? (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-300">
                      {results.detail || results.error}
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold">Generation Results</h3>
                        <span className="text-xs font-medium text-zinc-500">
                          {results.drug_like} of {results.generated} passed Lipinski Filter
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {results.molecules?.map((m, i) => (
                          <div
                            key={i}
                            className="group relative rounded-lg border border-zinc-100 bg-zinc-50 p-3 font-mono text-xs transition-colors hover:border-blue-200 hover:bg-white dark:border-zinc-900 dark:bg-zinc-950 dark:hover:border-blue-900"
                          >
                            {m.smiles}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Methodology Note for Experts */}
            <div className="mt-8 text-xs leading-relaxed text-zinc-500">
              **Methodology:** The generation process utilizes MCMC-based latent space sampling 
              around the seed SMILES. The validator assesses Molecular Weight (&lt;500), 
              LogP (&lt;5), H-Bond Donors (&le;5), and H-Bond Acceptors (&le;10).
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
