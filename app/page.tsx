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

  const [activeTab, setActiveTab] = useState<number | null>(null);

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
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-50 selection:bg-blue-500/30">
      {/* Animated Background Mesh */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] h-[70%] w-[70%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* Header / Hero */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-xl py-10 md:py-16">
        <div className="mx-auto max-w-5xl px-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Gen-AI Molecular Lab</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent sm:text-5xl md:text-6xl leading-[1.1]">
            De-Novo Molecular <br className="hidden sm:block" /> Generator
          </h1>
          <p className="mt-4 md:mt-6 text-base md:text-xl text-zinc-400 max-w-2xl mx-auto md:mx-0 leading-relaxed">
            Next-generation molecular optimization powered by <span className="text-white font-medium">NVIDIA MolMIM</span> and 
            validated through <span className="text-white font-medium">Lipinski's Rules</span>.
          </p>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-8 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          
          {/* Main Control Panel - Priority on Mobile */}
          <div className="order-1 lg:order-1 lg:col-span-8 space-y-6 md:space-y-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative rounded-2xl border border-white/10 bg-[#0c0c0e] p-5 md:p-8 shadow-2xl">
                <div className="space-y-6">
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-1 mb-2">
                      <label className="text-xs md:text-sm font-medium text-zinc-400 uppercase tracking-wide">Seed Molecule (SMILES)</label>
                      <span className="text-[8px] md:text-[10px] text-zinc-600 font-mono hidden sm:block">CC(=O)Oc1ccccc1C(=O)O</span>
                    </div>
                    <input
                      value={smiles}
                      onChange={(e) => setSmiles(e.target.value)}
                      placeholder="Enter SMILES string..."
                      className="h-12 md:h-14 w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 md:px-5 text-sm md:text-lg font-mono placeholder:text-zinc-700 outline-none focus:border-blue-500/50 focus:bg-white/[0.05] transition-all"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 md:gap-6">
                    <div className="w-full sm:w-32">
                      <label className="text-[10px] md:text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2 block">Batch Size</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={numMolecules}
                        onChange={(e) => setNumMolecules(Number(e.target.value))}
                        className="h-10 md:h-12 w-full rounded-xl border border-white/5 bg-white/[0.03] px-4 text-center text-base md:text-lg outline-none focus:border-blue-500/50 transition-all"
                      />
                    </div>
                    <button
                      onClick={generate}
                      disabled={loading || !smiles.trim()}
                      className="relative h-10 md:h-12 flex-1 rounded-xl bg-blue-600 font-bold text-sm md:text-base text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none group overflow-hidden"
                    >
                      <div className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <div className="h-3 w-3 md:h-4 md:w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span className="truncate">Optimizing...</span>
                          </>
                        ) : (
                          <>
                            <span>Generate Candidates</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </div>

                {/* Results Section */}
                {results && (
                  <div className="mt-8 md:mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
                      <h3 className="text-base md:text-lg font-bold text-zinc-100">Optimization Output</h3>
                      <div className="flex gap-4 self-end sm:self-auto">
                        <div className="text-right">
                          <p className="text-[8px] md:text-[10px] text-zinc-500 uppercase">Success Rate</p>
                          <p className="text-xs md:text-sm font-bold text-blue-400">
                            {Math.round((results.drug_like / (results.generated || 1)) * 100)}%
                          </p>
                        </div>
                        <div className="text-right border-l border-white/10 pl-4">
                          <p className="text-[8px] md:text-[10px] text-zinc-500 uppercase">Valid/Total</p>
                          <p className="text-xs md:text-sm font-bold text-emerald-400">
                            {results.drug_like} / {results.generated}
                          </p>
                        </div>
                      </div>
                    </div>

                    {results.detail || results.error ? (
                      <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-[10px] md:text-sm text-red-400 text-center">
                        {results.detail || results.error}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-2 md:gap-3 max-h-[300px] md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {results.molecules?.map((m, i) => (
                          <div
                            key={i}
                            className="group flex items-center gap-3 md:gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3 md:p-4 hover:border-blue-500/30 hover:bg-white/[0.05] transition-all cursor-default"
                          >
                            <span className="text-[8px] md:text-[10px] font-mono text-zinc-600 w-3 md:w-4">{(i + 1).toString().padStart(2, '0')}</span>
                            <div className="flex-1 font-mono text-[10px] md:text-sm text-zinc-300 break-all">
                              {m.smiles}
                            </div>
                            <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[8px] md:text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full uppercase font-bold tracking-tighter">Bio-Valid</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Technical Details - Clean & Fixed Position for Desktop */}
          <div className="order-2 lg:order-2 lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent">
              <div className="bg-[#0c0c0e] rounded-[15px] p-6 space-y-8">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 border-b border-white/5 pb-2">
                    Technical Architecture
                  </h2>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Generative Engine",
                        desc: "NVIDIA MolMIM: Iterative latent space traversal via Controlled MCMC sampling.",
                        icon: "⚡",
                      },
                      {
                        title: "Validation Core",
                        desc: "RDKit: Lipinski Rule-of-Five (MW, LogP, HBD, HBA) bioavailability filter.",
                        icon: "🧪",
                      },
                      {
                        title: "Cloud Pipeline",
                        desc: "Hybrid Deployment: Vercel (Frontend) + HF Spaces (FastAPI Backend).",
                        icon: "🌐",
                      },
                    ].map((item, i) => (
                      <div key={i} className="group">
                        <button 
                          onClick={() => setActiveTab(activeTab === i ? null : i)}
                          className="flex items-center justify-between w-full text-left group transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{item.icon}</span>
                            <h3 className="text-[11px] font-bold text-zinc-300 group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                              {item.title}
                            </h3>
                          </div>
                          <span className={`text-zinc-600 text-[10px] transition-transform duration-300 ${activeTab === i ? 'rotate-180' : ''}`}>▼</span>
                        </button>
                        
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === i ? 'max-h-24 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                          <p className="text-[10px] text-zinc-500 leading-relaxed font-medium pl-6 border-l border-white/5">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Footer for Scientific Details */}
      <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-xl py-12 mt-12">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            
            {/* Scientific Logic Section */}
            <div className="md:col-span-6 lg:col-span-5">
              <div className="rounded-2xl bg-blue-600/5 border border-blue-500/10 p-6">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Scientific Logic
                </h3>
                <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                  The generation process traverses the high-dimensional latent space to identify bio-isosteres and novel scaffolds. By optimizing within these learned representations, the model preserves critical drug-like features while exploring vast chemical diversity.
                </p>
              </div>
            </div>

            {/* Compliance Legend Section */}
            <div className="md:col-span-6 lg:col-span-7">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { label: "Lipinski", val: "Compliant", desc: "Rule of Five" },
                  { label: "Solubility", val: "Optimized", desc: "LogP < 5" },
                  { label: "Toxicity", val: "Screened", desc: "HBD/HBA" },
                  { label: "Stability", val: "Verified", desc: "MW < 500" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-1 border-l border-white/5 pl-4 transition-colors hover:border-blue-500/30 group">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter group-hover:text-blue-400/70 transition-colors">{item.label}</span>
                    <span className="text-[11px] font-bold text-zinc-200 uppercase">{item.val}</span>
                    <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-tight">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-center items-center gap-4">
            <p className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest">
              © 2026 De-Novo Molecular Generator • Powered by NVIDIA MolMIM
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
