"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type AnalyzerResult = {
  marketQuestion: string;
  platform: string;
  recommendation: "YES" | "NO" | "SKIP";
  confidence: number;
  edge: string;
  riskSummary: string;
  exitPlan: string;
};

type StoredUser = { email: string; name: string };

export default function AnalyzerPage() {
  const router = useRouter();
  const [user] = useState<StoredUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("pg_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzerResult | null>(null);

  useEffect(() => {
    if (localStorage.getItem("pg_auth") !== "true") {
      router.replace("/login");
      return;
    }
  }, [router]);

  const recommendationClass = useMemo(() => {
    if (!result) return "bg-slate-100 text-slate-600";
    if (result.recommendation === "YES") return "bg-emerald-100 text-emerald-700";
    if (result.recommendation === "NO") return "bg-rose-100 text-rose-700";
    return "bg-amber-100 text-amber-700";
  }, [result]);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setImage(file);
    setResult(null);
    setError(null);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !image) {
      setError("Choose a screenshot first.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append("email", user.email);
      formData.append("name", user.name);
      formData.append("image", image);

      const response = await fetch("/api/analyzer/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Analyzer request failed.");
      }
      setResult(data.result);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Analyzer failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Analyzer</h1>
            <p className="text-sm text-slate-600">Upload a market screenshot for an AI recommendation.</p>
          </div>
          <Link href="/dashboard" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            Back to dashboard
          </Link>
        </header>

        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <label className="block text-sm font-medium text-slate-700" htmlFor="screenshot">
            Screenshot
          </label>
          <input
            id="screenshot"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onFileChange}
            className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
          />
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Preview" className="max-h-72 rounded-xl border border-slate-200 object-contain" />
          ) : null}
          <button
            disabled={loading || !image}
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
          >
            {loading ? "Analyzing..." : "Analyze screenshot"}
          </button>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </form>

        {result ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Analysis Result</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${recommendationClass}`}>
                {result.recommendation}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Market</p>
                <p className="text-sm text-slate-800">{result.marketQuestion}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Platform</p>
                <p className="text-sm text-slate-800">{result.platform}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Confidence</p>
                <p className="text-sm text-slate-800">{result.confidence}%</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Estimated Edge</p>
                <p className="text-sm text-slate-800">{result.edge}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Risk Summary</p>
              <p className="text-sm text-slate-800">{result.riskSummary}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Exit Plan</p>
              <p className="text-sm text-slate-800">{result.exitPlan}</p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
