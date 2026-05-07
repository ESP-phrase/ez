"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type User = { email: string; name: string };

type Market = {
  id: string;
  title: string;
  platform: string;
  outcomeA: string;
  outcomeB: string;
  outcomeAOdds: number;
  outcomeBOdds: number;
};

type Position = {
  id: string;
  side: "YES" | "NO";
  stake: number;
  entryOdds: number;
  markOdds: number;
  pnl: number;
  status: "OPEN" | "CLOSED";
  market: { title: string; platform: string };
};

type Summary = {
  totalPositions: number;
  openPositions: number;
  closedPositions: number;
  openPnl: number;
  realizedPnl: number;
};

export default function PaperTradingPage() {
  const router = useRouter();
  const [user] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("pg_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [markets, setMarkets] = useState<Market[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [marketId, setMarketId] = useState("");
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [stake, setStake] = useState("25");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(() => markets.find((m) => m.id === marketId), [markets, marketId]);

  useEffect(() => {
    if (localStorage.getItem("pg_auth") !== "true") {
      router.replace("/login");
      return;
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;
    void refreshData(user);
  }, [user]);

  async function refreshData(activeUser: User) {
    try {
      setLoading(true);
      setError(null);
      const [marketsRes, positionsRes] = await Promise.all([
        fetch("/api/markets/snapshot"),
        fetch(`/api/paper-trades?email=${encodeURIComponent(activeUser.email)}&name=${encodeURIComponent(activeUser.name)}`),
      ]);

      const marketsJson = await marketsRes.json();
      const positionsJson = await positionsRes.json();
      if (!marketsRes.ok) throw new Error(marketsJson.error ?? "Failed to fetch markets.");
      if (!positionsRes.ok) throw new Error(positionsJson.error ?? "Failed to fetch positions.");

      setMarkets(marketsJson.markets ?? []);
      setMarketId((prev) => prev || marketsJson.markets?.[0]?.id || "");
      setPositions(positionsJson.positions ?? []);
      setSummary(positionsJson.summary ?? null);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Load failed.");
    } finally {
      setLoading(false);
    }
  }

  async function syncNow() {
    if (!user) return;
    await fetch("/api/paper-sync", { method: "POST" });
    await refreshData(user);
  }

  async function onOpenPosition(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    try {
      const response = await fetch("/api/paper-trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          marketId,
          side,
          stake: Number(stake),
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Could not open trade.");
      }
      await refreshData(user);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not open trade.");
    }
  }

  async function closePosition(positionId: string) {
    if (!user) return;
    try {
      const response = await fetch("/api/paper-trades", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error ?? "Could not close position.");
      }
      await refreshData(user);
    } catch (closeError) {
      setError(closeError instanceof Error ? closeError.message : "Could not close position.");
    }
  }

  if (loading) {
    return <main className="min-h-screen grid place-items-center bg-slate-50 text-slate-600">Loading paper trading...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Paper Trading</h1>
          <button onClick={syncNow} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
            Sync latest odds
          </button>
        </div>

        {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Total Positions" value={summary?.totalPositions ?? 0} />
          <StatCard label="Open Positions" value={summary?.openPositions ?? 0} />
          <StatCard label="Closed Positions" value={summary?.closedPositions ?? 0} />
          <StatCard label="Open P&L" value={`$${(summary?.openPnl ?? 0).toFixed(2)}`} />
          <StatCard label="Realized P&L" value={`$${(summary?.realizedPnl ?? 0).toFixed(2)}`} />
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <form onSubmit={onOpenPosition} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Open simulated trade</h2>
            <label className="block text-sm text-slate-700">
              Market
              <select value={marketId} onChange={(e) => setMarketId(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-slate-700">
              Side
              <select value={side} onChange={(e) => setSide(e.target.value as "YES" | "NO")} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </label>
            <label className="block text-sm text-slate-700">
              Stake (USD)
              <input value={stake} onChange={(e) => setStake(e.target.value)} type="number" min="1" step="0.01" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </label>
            {selected ? (
              <p className="text-xs text-slate-500">
                Current odds: {selected.outcomeA} {Math.round(selected.outcomeAOdds * 100)}% / {selected.outcomeB}{" "}
                {Math.round(selected.outcomeBOdds * 100)}%
              </p>
            ) : null}
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white" type="submit">
              Open Position
            </button>
          </form>

          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Positions</h2>
            <div className="space-y-2">
              {positions.length === 0 ? <p className="text-sm text-slate-500">No positions yet.</p> : null}
              {positions.map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{p.market.title}</p>
                      <p className="text-xs text-slate-500">
                        {p.market.platform} - {p.side} - stake ${p.stake.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${p.pnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        ${p.pnl.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Entry {Math.round(p.entryOdds * 100)}% / Mark {Math.round(p.markOdds * 100)}%
                      </p>
                    </div>
                  </div>
                  {p.status === "OPEN" ? (
                    <button onClick={() => closePosition(p.id)} className="mt-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      Close Position
                    </button>
                  ) : (
                    <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      Closed
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
