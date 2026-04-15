"use client";

import { useState } from "react";

type GenerateResponse = {
  generated: number;
  drug_like: number;
  molecules: Array<{ smiles: string; score?: number }>;
  raw?: unknown;
  detail?: string;
  error?: string;
};

export default function Home() {
  const [smiles, setSmiles] = useState("");
  const [numMolecules, setNumMolecules] = useState(30);
  const [algorithm, setAlgorithm] = useState("CMA-ES");
  const [propertyName, setPropertyName] = useState("QED");
  const [maximize, setMaximize] = useState(true);
  const [minSimilarity, setMinSimilarity] = useState(0.3);
  const [particles, setParticles] = useState(30);
  const [iterations, setIterations] = useState(10);
  const [results, setResults] = useState<GenerateResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<number | null>(null);

  const examples = [
    { name: "Lisuride", smiles: "[H][C@@]12Cc3c[nH]c4cccc(C1=C[C@H](NC(=O)N(CC)CC)CN2C)c34" },
    { name: "Lenalidomide", smiles: "NC1CCC(N2C(=O)c3cccc(N)c3C2)C(=O)O1" },
    { name: "Ensitrelvir", smiles: "Cn1cc(nc1-c1ccc(cc1F)F)-c1nc(c(s1)C#N)N1CCN(CC1)c1ccc(nc1)F" },
    { name: "Ibuprofen", smiles: "CC(C)Cc1ccc(cc1)C(C)C(=O)O" },
    { name: "Floxuridine", smiles: "OC[C@H]1O[C@H](C[C@@H]1O)n1ccc(=O)[nH]c1F" },
    { name: "Leflunomide", smiles: "Cc1onc(c1C(=O)Nc1ccc(cc1)C(F)(F)F)-c1ccccc1" },
    { name: "Tolnaftate", smiles: "CC1=CC=C(C=C1)N(C)C(=S)OC2=CC3=CC=CC=C3C=C2" },
    { name: "Ifenprodil", smiles: "CC(Cc1ccc(cc1)O)C(O)CN2CCC(CC2)Cc3ccccc3" },
    { name: "Amoxicillin", smiles: "CC1(C(N2C(S1)C(C2=O)NC(=O)C(c3ccc(cc3)O)N)C(=O)O)C" },
    { name: "Donepezil", smiles: "COc1cc2c(cc1OC)C(=O)C(CC2)CNCc3ccccc3" },
    { name: "Lovastatin", smiles: "CC[C@H](C)[C@H]1CC[C@@H](C)[C@@H]2C=C[C@H](C)[C@H](CC[C@H]3CC(=O)O[C@H](C3)C)C12" },
    { name: "Iloperidone", smiles: "CC(=O)c1ccc(OCCN2CCC(CC2)c3c(no1)c4ccc(cc4)F)c(c1)OC" },
    { name: "Dicloxacillin", smiles: "CC1=C(C(=NO1)c2c(cccc2Cl)Cl)C(=O)NC3C4N(C3=O)C(C(S4)(C)C)C(=O)O" },
    { name: "Caffeine", smiles: "Cn1cnc2c1c(=O)n(c(=O)n2C)C" },
    { name: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O" }
  ];

  const [outputTab, setOutputTab] = useState<"preview" | "json">("preview");

  async function generate() {
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          smiles,
          num_molecules: numMolecules,
          algorithm,
          property_name: propertyName,
          minimize: !maximize,
          min_similarity: minSimilarity,
          particles,
          iterations,
        }),
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
    <div className="min-h-screen bg-[#0b0b0b] font-sans text-zinc-300 selection:bg-[#76b900]/30">
      <div className="mx-auto max-w-[1400px] min-h-screen flex flex-col md:flex-row border-x border-white/5">
        
        {/* Left Column: Input Panel */}
        <div className="flex-1 border-r border-white/10 flex flex-col">
          <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2 className="text-white font-bold text-lg">Input</h2>
              <nav className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <span className="text-[#76b900] border-b-2 border-[#76b900] pb-1 cursor-pointer">Try</span>
                <span className="hover:text-zinc-300 cursor-pointer">Shell</span>
                <span className="hover:text-zinc-300 cursor-pointer">Python</span>
              </nav>
            </div>
            <span className="text-[#76b900] text-xs font-bold cursor-pointer hover:underline">View Examples</span>
          </header>

          <div className="p-8 space-y-8 flex-1 overflow-y-auto">
            {/* SMILES Examples */}
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">
                SMILES Examples <span className="text-zinc-600 italic">ⓘ</span>
              </label>
              <select
                onChange={(e) => {
                  const ex = examples.find(ex => ex.name === e.target.value);
                  if (ex) setSmiles(ex.smiles);
                }}
                className="w-full h-11 rounded-lg border border-[#76b900] bg-black px-4 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-[#76b900] transition-all"
              >
                <option value="">Select a molecule...</option>
                {examples.map(ex => (
                  <option key={ex.name} value={ex.name}>{ex.name}</option>
                ))}
              </select>
            </div>

            {/* SMILES Input */}
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">
                SMILES String <span className="text-red-500 text-lg">*</span>
              </label>
              <textarea
                value={smiles}
                onChange={(e) => setSmiles(e.target.value)}
                placeholder="Enter SMILES string..."
                className="w-full h-28 rounded-lg border border-white/10 bg-[#161616] p-4 text-sm font-mono text-[#76b900] placeholder:text-zinc-800 outline-none focus:border-[#76b900]/50 transition-all resize-none"
              />
            </div>

            {/* Batch Size */}
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">
                Number of Molecules to generate <span className="text-zinc-600 italic">ⓘ</span> <span className="text-red-500 text-lg">*</span>
              </label>
              <input
                type="number"
                value={numMolecules}
                onChange={(e) => setNumMolecules(Number(e.target.value))}
                className="w-full h-11 rounded-lg border border-white/10 bg-[#161616] px-4 text-sm outline-none focus:border-[#76b900]/50 transition-all"
              />
            </div>

            {/* Algorithm */}
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">
                Sampling Algorithm <span className="text-zinc-600 italic">ⓘ</span>
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full h-11 rounded-lg border border-white/10 bg-[#161616] px-4 text-sm outline-none focus:border-[#76b900]/50 transition-all"
              >
                <option value="CMA-ES">CMA-ES Controlled Generation</option>
                <option value="StandardDeviation">Sampling Standard Deviation</option>
              </select>
            </div>

            {/* Property Toggle */}
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">
                  Property to Optimize <span className="text-zinc-600 italic">ⓘ</span>
                </label>
                <select
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-full h-11 rounded-lg border border-[#76b900] bg-black px-4 text-sm outline-none focus:ring-1 focus:ring-[#76b900] transition-all"
                >
                  <option value="QED">QED</option>
                  <option value="plogP">plogP</option>
                </select>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div 
                  onClick={() => setMaximize(!maximize)}
                  className={`w-14 h-7 rounded-full transition-colors cursor-pointer relative ${maximize ? 'bg-[#76b900]' : 'bg-zinc-800'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-black transition-all ${maximize ? 'left-8' : 'left-1'}`} />
                </div>
                <span className="text-xs font-bold text-zinc-400">Maximize</span>
              </div>
            </div>

            {/* Similarity Constraint */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                  Similarity Constraint <span className="text-red-500 text-lg">*</span> <span className="text-zinc-600 italic ml-1 text-sm">ⓘ</span>
                </label>
                <div className="bg-black border border-white/10 rounded px-3 py-1 text-sm font-bold text-white min-w-[50px] text-center">
                  {minSimilarity}
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={minSimilarity}
                onChange={(e) => setMinSimilarity(Number(e.target.value))}
                className="w-full accent-[#76b900] bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 mt-2 font-bold px-1">
                {Array.from({length: 11}).map((_, i) => (
                  <span key={i}>{i/10 === 0 ? 0 : i/10 === 1 ? 1 : i/10}</span>
                ))}
              </div>
            </div>

            {/* Recommended Defaults */}
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-black accent-[#76b900]" />
              <label className="text-xs font-bold text-zinc-400">Use recommended defaults</label>
            </div>

            {/* Advanced Settings */}
            <div className="grid grid-cols-2 gap-6 pb-12">
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">
                  Particles <span className="text-red-500 text-lg">*</span> <span className="text-zinc-600 italic ml-1">ⓘ</span>
                </label>
                <input
                  type="number"
                  value={particles}
                  onChange={(e) => setParticles(Number(e.target.value))}
                  className="w-full h-11 rounded-lg border border-white/10 bg-[#161616] px-4 text-sm outline-none focus:border-[#76b900]/50 transition-all"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">
                  Iterations <span className="text-red-500 text-lg">*</span> <span className="text-zinc-600 italic ml-1">ⓘ</span>
                </label>
                <input
                  type="number"
                  value={iterations}
                  onChange={(e) => setIterations(Number(e.target.value))}
                  className="w-full h-11 rounded-lg border border-white/10 bg-[#161616] px-4 text-sm outline-none focus:border-[#76b900]/50 transition-all"
                />
              </div>
            </div>
          </div>

          <footer className="p-6 border-t border-white/10 bg-black flex flex-col gap-6">
            <div className="text-[9px] text-zinc-600 leading-normal uppercase tracking-tighter">
              <span className="font-bold">Governing Terms:</span> Your use of this API is governed by the <span className="underline cursor-pointer">NVIDIA API Trial Service Terms of Use</span>; and the use of this model is governed by the <span className="underline cursor-pointer">NVIDIA AI Foundation Models Community License</span>.
            </div>
            <div className="flex justify-end gap-6 items-center">
              <button 
                onClick={() => {
                  setSmiles("");
                  setResults(null);
                }}
                className="text-xs font-bold text-[#76b900] uppercase tracking-widest hover:text-[#76b900]/80 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={generate}
                disabled={loading || !smiles.trim()}
                className="h-12 px-10 rounded bg-[#76b900] font-bold text-sm text-black hover:bg-[#86d400] transition-all disabled:opacity-50 active:scale-95 uppercase tracking-widest"
              >
                {loading ? "Running..." : "Run"}
              </button>
            </div>
          </footer>
        </div>

        {/* Right Column: Output Panel */}
        <div className="flex-[1.2] flex flex-col bg-[#0b0b0b]">
          <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2 className="text-white font-bold text-lg">Output</h2>
              <nav className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <span 
                  onClick={() => setOutputTab("preview")}
                  className={`${outputTab === "preview" ? "text-white border-b-2 border-white" : "hover:text-zinc-300"} pb-1 cursor-pointer transition-all`}
                >
                  Preview
                </span>
                <span 
                  onClick={() => setOutputTab("json")}
                  className={`${outputTab === "json" ? "text-white border-b-2 border-white" : "hover:text-zinc-300"} pb-1 cursor-pointer transition-all`}
                >
                  JSON
                </span>
              </nav>
            </div>
            <div className="flex items-center gap-2 text-[#76b900] text-xs font-bold cursor-pointer hover:underline">
              <span className="text-lg">↓</span> Download
            </div>
          </header>

          <div className="flex-1 p-8 relative overflow-hidden flex flex-col">
            {results ? (
              outputTab === "preview" ? (
                <div className="flex-1 overflow-y-auto pr-12 custom-scrollbar">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
                    {results.molecules?.map((m, i) => (
                      <div key={i} className="flex flex-col">
                        <div className="aspect-[4/3] w-full bg-transparent flex items-center justify-center relative group">
                          {/* Molecule Sketch Placeholder - White lines on dark */}
                          <div className="w-full h-full flex items-center justify-center p-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <svg viewBox="0 0 100 100" className="w-full h-full stroke-white fill-none stroke-[0.5]">
                              <path d="M30,50 L50,30 L70,50 L50,70 Z M50,30 L50,10 M70,50 L90,50 M50,70 L50,90 M30,50 L10,50" />
                              <circle cx="50" cy="10" r="2" fill="white" />
                              <circle cx="90" cy="50" r="2" fill="white" />
                              <circle cx="50" cy="90" r="2" fill="white" />
                              <circle cx="10" cy="50" r="2" fill="white" />
                            </svg>
                          </div>
                        </div>
                        {typeof m.score === "number" && (
                          <div className="w-full mt-1">
                            <div className="h-7 w-full bg-[#d4e157] text-black text-xs font-bold flex items-center justify-center">
                              {m.score.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-[#050505] border border-white/5 rounded-lg p-6 font-mono text-sm overflow-auto custom-scrollbar relative">
                  <button 
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(results, null, 2))}
                    className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded transition-colors text-zinc-500 hover:text-white"
                    title="Copy JSON"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
                  <pre className="text-zinc-400">
                    <span className="text-white">[</span>
                    {results.molecules?.map((m, i) => (
                      <div key={i} className="pl-4">
                        <span className="text-white">{"{"}</span>
                        <div className="pl-4">
                          <span className="text-[#ff79c6]">"sample"</span>: <span className="text-[#f1fa8c]">"{m.smiles}"</span>,
                          <br />
                          <span className="text-[#ff79c6]">"score"</span>: <span className="text-[#bd93f9]">{m.score?.toFixed(16)}</span>
                        </div>
                        <span className="text-white">{"}"}</span>{i < results.molecules.length - 1 ? "," : ""}
                      </div>
                    ))}
                    <span className="text-white">]</span>
                  </pre>
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-800 text-sm font-bold uppercase tracking-widest italic opacity-50">
                Awaiting Execution...
              </div>
            )}

            {/* Color Gradient Scale on the far right */}
            {results && outputTab === "preview" && (
              <div className="absolute right-6 top-10 bottom-10 w-4 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-[#76b900]">1.00</span>
                <div className="flex-1 w-full bg-gradient-to-b from-[#ffff00] via-[#76b900] to-[#004d40] rounded-sm shadow-[0_0_15px_rgba(118,185,0,0.2)]" />
                <span className="text-[10px] font-bold text-[#004d40]">0.40</span>
                <div className="absolute right-6 top-[20%] text-[10px] font-bold text-zinc-600">0.80</div>
                <div className="absolute right-6 top-[50%] text-[10px] font-bold text-zinc-600">0.60</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #161616; border-radius: 10px; }
        body { overflow-x: hidden; }
      `}</style>
    </div>
  );
}
