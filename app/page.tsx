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

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ smiles, num_molecules: numMolecules }),
    });

    const data = (await res.json()) as GenerateResponse;
    setResults(data);
    setLoading(false);
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col gap-8 py-20 px-6 bg-white dark:bg-black">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            De-Novo Drug Design
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Generate candidates with MolMIM and filter via Lipinski rules.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
            Input SMILES
          </label>
          <input
            value={smiles}
            onChange={(e) => setSmiles(e.target.value)}
            placeholder="CC(=O)Oc1ccccc1C(=O)O"
            className="h-12 w-full rounded-lg border border-zinc-200 bg-white px-4 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
          />

          <div className="flex gap-3 items-center">
            <label className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
              Count
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={numMolecules}
              onChange={(e) => setNumMolecules(Number(e.target.value))}
              className="h-10 w-28 rounded-lg border border-zinc-200 bg-white px-3 text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
            />

            <button
              onClick={generate}
              disabled={loading || smiles.trim().length === 0}
              className="ml-auto h-10 rounded-lg bg-zinc-900 px-4 text-zinc-50 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
              {loading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {results && (
          <div className="flex flex-col gap-3">
            {results.detail || results.error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100">
                {results.detail || results.error}
              </div>
            ) : (
              <div className="text-sm text-zinc-700 dark:text-zinc-300">
                {results.drug_like} drug-like molecules out of {results.generated}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              {results.molecules?.map((m, i) => (
                <div
                  key={`${m.smiles}-${i}`}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-3 font-mono text-sm text-zinc-900 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
                >
                  {m.smiles}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
