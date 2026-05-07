"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import Sidebar from "@/components/dashboard/sidebar";

type User = { email: string; name: string };

type Subscription = {
  id: string;
  isActive: boolean;
  autoCopyEnabled: boolean;
  maxStakePerTrade: number;
  maxSlippagePct: number;
  maxOpenExposure: number;
  sizeMultiplier: number;
  sourceWallet: {
    walletAddress: string;
    displayName: string;
    winRate: number;
    roi30d: number;
    pnl30d: number;
  };
};

type ActivityResponse = {
  summary: {
    totalExecutions: number;
    submitted: number;
    failed: number;
    skipped: number;
    realizedPnl: number;
  };
  executions: Array<{
    id: string;
    status: string;
    mirroredStake: number;
    errorMessage?: string | null;
    createdAt: string;
    signal: {
      side: "YES" | "NO";
      odds: number;
      market: { title: string };
      sourceWallet: { displayName: string };
    };
  }>;
};

type RecentTrade = {
  walletAddress: string;
  walletName: string;
  id: string;
  market: string;
  side: string;
  price: number;
  size: number;
  timestamp: string;
  polymarketUrl: string;
  txHash?: string | null;
  explorerUrl?: string | null;
};

async function readJsonSafe(response: Response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: "Server returned a non-JSON response." };
  }
}

export default function CopyTradingPage() {
  const router = useRouter();
  const [user] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("pg_user");
      return raw ? JSON.parse(raw) : { email: "trader@polygoat.io", name: "trader" };
    } catch {
      return { email: "trader@polygoat.io", name: "trader" };
    }
  });
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [walletAddress, setWalletAddress] = useState("");
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem("pg_auth") !== "true") {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;
    void refreshAll(user);
  }, [user]);

  async function refreshAll(activeUser: User) {
    try {
      setError(null);
      const [subsRes, activityRes, tradesRes] = await Promise.all([
        fetch(`/api/copy-trader/follow?email=${encodeURIComponent(activeUser.email)}&name=${encodeURIComponent(activeUser.name)}`),
        fetch(`/api/copy-trader/activity?email=${encodeURIComponent(activeUser.email)}&name=${encodeURIComponent(activeUser.name)}`),
        fetch(`/api/copy-trader/recent-trades?email=${encodeURIComponent(activeUser.email)}&name=${encodeURIComponent(activeUser.name)}`),
      ]);
      const subsJson = await readJsonSafe(subsRes);
      const activityJson = await readJsonSafe(activityRes);
      const tradesJson = await readJsonSafe(tradesRes);
      if (!subsRes.ok) throw new Error(String(subsJson.error ?? "Failed to load subscriptions."));
      if (!activityRes.ok) throw new Error(String(activityJson.error ?? "Failed to load activity."));
      if (!tradesRes.ok) throw new Error(String(tradesJson.error ?? "Failed to load recent trades."));
      setSubscriptions((subsJson.subscriptions as Subscription[] | undefined) ?? []);
      setActivity(activityJson as unknown as ActivityResponse);
      setRecentTrades((tradesJson.trades as RecentTrade[] | undefined) ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load copy trader.");
    }
  }

  async function onFollow(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    try {
      const response = await fetch("/api/copy-trader/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          walletAddress,
        }),
      });
      const json = await readJsonSafe(response);
      if (!response.ok) throw new Error(String(json.error ?? "Follow failed."));
      setWalletAddress("");
      await refreshAll(user);
    } catch (followError) {
      setError(followError instanceof Error ? followError.message : "Follow failed.");
    }
  }

  async function updateSubscription(subscriptionId: string, payload: Record<string, unknown>) {
    if (!user) return;
    const response = await fetch("/api/copy-trader/follow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, ...payload }),
    });
    const json = await readJsonSafe(response);
    if (!response.ok) {
      throw new Error(String(json.error ?? "Update failed."));
    }
    await refreshAll(user);
  }

  async function deleteSubscription(subscriptionId: string) {
    if (!user) return;
    const response = await fetch("/api/copy-trader/follow", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId }),
    });
    const json = await readJsonSafe(response);
    if (!response.ok) {
      throw new Error(String(json.error ?? "Delete failed."));
    }
    await refreshAll(user);
  }

  async function syncNow() {
    if (!user) return;
    setError(null);
    const response = await fetch("/api/copy-trader/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, name: user.name }),
    });
    const json = await readJsonSafe(response);
    if (!response.ok) {
      setError(String(json.error ?? "Sync failed."));
      return;
    }
    await refreshAll(user);
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Copy Trader - Polymarket</h1>
            <p className="text-sm text-slate-600">Auto-copy followed wallets with risk controls and kill switch.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={syncNow} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
              Sync Signals
            </button>
            <Link href="/dashboard/copy-trading/settings" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              Settings
            </Link>
          </div>
        </header>

        {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <MetricCard label="Executions" value={activity?.summary.totalExecutions ?? 0} />
          <MetricCard label="Submitted" value={activity?.summary.submitted ?? 0} />
          <MetricCard label="Failed" value={activity?.summary.failed ?? 0} />
          <MetricCard label="Realized PnL" value={`$${(activity?.summary.realizedPnl ?? 0).toFixed(2)}`} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Follow wallet</h2>
          <form onSubmit={onFollow} className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              value={walletAddress}
              onChange={(event) => setWalletAddress(event.target.value)}
              placeholder="0x wallet address"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white"
              required
            />
            <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
              Follow
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Followed traders</h2>
          <div className="mt-3 space-y-3">
            {subscriptions.length === 0 ? <p className="text-sm text-slate-500">No followed wallets yet.</p> : null}
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{subscription.sourceWallet.displayName}</p>
                    <p className="text-xs text-slate-500">{subscription.sourceWallet.walletAddress}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void updateSubscription(subscription.id, { autoCopyEnabled: !subscription.autoCopyEnabled })}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                        subscription.autoCopyEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {subscription.autoCopyEnabled ? "Auto ON" : "Auto OFF"}
                    </button>
                    <button
                      onClick={() => void updateSubscription(subscription.id, { isActive: !subscription.isActive })}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {subscription.isActive ? "Pause" : "Resume"}
                    </button>
                    <button
                      onClick={() => void deleteSubscription(subscription.id)}
                      className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-600">
                  Max stake ${subscription.maxStakePerTrade} | Slippage {subscription.maxSlippagePct}% | Exposure ${subscription.maxOpenExposure} | Multiplier {subscription.sizeMultiplier}x
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Execution activity</h2>
          <div className="mt-3 space-y-2">
            {activity?.executions.length ? null : <p className="text-sm text-slate-500">No executions yet.</p>}
            {activity?.executions.map((execution) => (
              <div key={execution.id} className="rounded-lg border border-slate-200 p-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{execution.signal.market.title}</p>
                  <p className="text-xs text-slate-500">
                    {execution.signal.sourceWallet.displayName} - {execution.signal.side} at {(execution.signal.odds * 100).toFixed(1)}%
                  </p>
                  {execution.errorMessage ? <p className="text-xs text-rose-600 mt-1">{execution.errorMessage}</p> : null}
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-700">${execution.mirroredStake.toFixed(2)}</p>
                  <p className="text-xs text-slate-500">{execution.status}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-slate-900">Recent followed-wallet trades (Polymarket API)</h2>
          <div className="mt-3 space-y-2">
            {recentTrades.length === 0 ? <p className="text-sm text-slate-500">No recent wallet trades found.</p> : null}
            {recentTrades.map((trade) => (
              <div key={`${trade.walletAddress}-${trade.id}`} className="rounded-lg border border-slate-200 p-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{trade.market}</p>
                  <p className="text-xs text-slate-500">
                    {trade.walletName} - {trade.side} at {(trade.price * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-slate-500">
                    {trade.timestamp ? new Date(trade.timestamp).toLocaleString() : "Unknown time"}
                  </p>
                  <a
                    href={trade.polymarketUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Open on Polymarket {"->"}
                  </a>
                  {trade.explorerUrl ? (
                    <a
                      href={trade.explorerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      View Tx on chain
                    </a>
                  ) : null}
                </div>
                <p className="text-xs font-semibold text-slate-700">Size {trade.size.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase font-semibold tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
