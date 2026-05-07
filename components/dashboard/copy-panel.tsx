"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Copy, RefreshCw, ToggleLeft, ToggleRight, Trash2, Plus } from "lucide-react";

type Subscription = {
  id: string;
  isActive: boolean;
  autoCopyEnabled: boolean;
  maxStakePerTrade: number;
  sourceWallet: { walletAddress: string; displayName: string; winRate: number; roi30d: number };
};

type Summary = { totalExecutions: number; submitted: number; failed: number; realizedPnl: number };

type Props = { userEmail: string; userName: string };

export default function CopyPanel({ userEmail, userName }: Props) {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [walletInput, setWalletInput] = useState("");
  const [following, setFollowing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [subRes, actRes] = await Promise.all([
        fetch(`/api/copy-trader/follow?email=${encodeURIComponent(userEmail)}&name=${encodeURIComponent(userName)}`),
        fetch(`/api/copy-trader/activity?email=${encodeURIComponent(userEmail)}&name=${encodeURIComponent(userName)}`),
      ]);
      if (subRes.ok) {
        const d = (await subRes.json()) as { subscriptions: Subscription[] };
        setSubs(d.subscriptions ?? []);
      }
      if (actRes.ok) {
        const d = (await actRes.json()) as { summary: Summary };
        setSummary(d.summary ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, [userEmail, userName]);

  useEffect(() => { void load(); }, [load]);

  async function sync() {
    setSyncing(true);
    try {
      await fetch("/api/copy-trader/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, name: userName }),
      });
      await load();
    } finally {
      setSyncing(false);
    }
  }

  async function follow(e: FormEvent) {
    e.preventDefault();
    if (!walletInput.trim()) return;
    setFollowing(true);
    setError(null);
    try {
      const res = await fetch("/api/copy-trader/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, name: userName, walletAddress: walletInput.trim() }),
      });
      if (!res.ok) throw new Error("Failed to follow.");
      setWalletInput("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally {
      setFollowing(false);
    }
  }

  async function toggleAutoCopy(sub: Subscription) {
    await fetch("/api/copy-trader/follow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId: sub.id, autoCopyEnabled: !sub.autoCopyEnabled }),
    });
    await load();
  }

  async function unfollow(sub: Subscription) {
    await fetch("/api/copy-trader/follow", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId: sub.id }),
    });
    await load();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary row */}
      {summary && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Executions", value: summary.totalExecutions },
            { label: "Submitted", value: summary.submitted },
            { label: "Failed", value: summary.failed },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-center">
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
              <p className="text-[11px] text-slate-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Follow form */}
      <form onSubmit={follow} className="flex gap-2">
        <input
          value={walletInput}
          onChange={(e) => setWalletInput(e.target.value)}
          placeholder="Wallet address to follow…"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400"
        />
        <button
          type="submit"
          disabled={following || !walletInput.trim()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          <Plus className="w-3 h-3" />
          Follow
        </button>
        <button
          type="button"
          onClick={() => void sync()}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:border-slate-300 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
          Sync
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Subscriptions */}
      {subs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
          <Copy className="w-6 h-6 text-slate-300" />
          <p className="text-xs">No wallets followed yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {subs.map((sub) => (
            <div key={sub.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{sub.sourceWallet.displayName}</p>
                <p className="text-[11px] text-slate-400 font-mono truncate">{sub.sourceWallet.walletAddress}</p>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500">
                <span>Max ${sub.maxStakePerTrade}</span>
              </div>
              <button
                onClick={() => void toggleAutoCopy(sub)}
                className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${sub.autoCopyEnabled ? "text-emerald-600" : "text-slate-400"}`}
                title={sub.autoCopyEnabled ? "Auto-copy ON" : "Auto-copy OFF"}
              >
                {sub.autoCopyEnabled
                  ? <ToggleRight className="w-4 h-4" />
                  : <ToggleLeft className="w-4 h-4" />}
                {sub.autoCopyEnabled ? "Auto" : "Off"}
              </button>
              <button
                onClick={() => void unfollow(sub)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
