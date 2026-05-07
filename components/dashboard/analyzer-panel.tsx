"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { ScanSearch, Upload, X } from "lucide-react";

type AnalyzerResult = {
  marketQuestion: string;
  platform: string;
  recommendation: "YES" | "NO" | "SKIP";
  confidence: number;
  edge: string;
  riskSummary: string;
  exitPlan: string;
};

type Props = { userEmail: string; userName: string };

export default function AnalyzerPanel({ userEmail, userName }: Props) {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzerResult | null>(null);

  const recColor = useMemo(() => {
    if (!result) return "";
    if (result.recommendation === "YES") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (result.recommendation === "NO") return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  }, [result]);

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImage(file);
    setResult(null);
    setError(null);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function clearImage() {
    setImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!image) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("email", userEmail);
      form.append("name", userName);
      form.append("image", image);
      const res = await fetch("/api/analyzer/analyze", { method: "POST", body: form });
      const data = (await res.json()) as { result?: AnalyzerResult; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Analysis failed.");
      if (data.result) setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-3">
        {previewUrl ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="w-full max-h-56 object-contain rounded-xl border border-slate-200 bg-slate-50" />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50"
            >
              <X className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-all">
            <Upload className="w-5 h-5 text-slate-400 mb-1.5" />
            <span className="text-xs font-medium text-slate-500">Drop a market screenshot or click to upload</span>
            <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPEG, WebP</span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFileChange} className="hidden" />
          </label>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading || !image}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ScanSearch className="w-3.5 h-3.5" />
            {loading ? "Analyzing…" : "Analyze"}
          </button>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </form>

      {result && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{result.platform}</p>
              <p className="text-sm font-medium text-slate-900 mt-0.5 leading-snug">{result.marketQuestion}</p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
              <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold ${recColor}`}>
                {result.recommendation}
              </span>
              <span className="text-[11px] font-bold text-slate-600">{result.confidence}% conf.</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Edge</p>
              <p className="text-slate-800 font-medium mt-0.5">{result.edge}</p>
            </div>
            <div className="rounded-lg bg-white border border-slate-200 px-3 py-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Exit</p>
              <p className="text-slate-800 font-medium mt-0.5">{result.exitPlan}</p>
            </div>
          </div>

          <div className="rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs">
            <p className="text-[11px] font-semibold text-slate-400 uppercase mb-0.5">Risk</p>
            <p className="text-slate-700">{result.riskSummary}</p>
          </div>
        </div>
      )}
    </div>
  );
}
