"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import Sidebar from "@/components/dashboard/sidebar";

type User = { email: string; name: string };

type CopySetting = {
  killSwitchEnabled: boolean;
  dailyLossLimit: number;
  maxFailedExecs: number;
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

export default function CopyTraderSettingsPage() {
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
  const [setting, setSetting] = useState<CopySetting>({
    killSwitchEnabled: false,
    dailyLossLimit: 200,
    maxFailedExecs: 5,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("pg_auth") !== "true") {
      router.replace("/login");
    }
  }, [router]);

  async function loadSetting(activeUser: User) {
    const response = await fetch(
      `/api/copy-trader/settings?email=${encodeURIComponent(activeUser.email)}&name=${encodeURIComponent(activeUser.name)}`
    );
    const json = await readJsonSafe(response);
    if (response.ok) {
      const nextSetting = json.setting as CopySetting | undefined;
      setSetting({
        killSwitchEnabled: nextSetting?.killSwitchEnabled ?? false,
        dailyLossLimit: nextSetting?.dailyLossLimit ?? 200,
        maxFailedExecs: nextSetting?.maxFailedExecs ?? 5,
      });
    } else {
      setError(String(json.error ?? "Failed to load settings."));
    }
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    try {
      setSaving(true);
      setError(null);
      const response = await fetch("/api/copy-trader/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          ...setting,
        }),
      });
      const json = await readJsonSafe(response);
      if (!response.ok) throw new Error(String(json.error ?? "Save failed."));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Copy Trader Settings</h1>
            <p className="text-sm text-slate-600">Configure global safety controls and emergency stop.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (user) {
                  void loadSetting(user);
                }
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              Refresh
            </button>
            <Link href="/dashboard/copy-trading" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
              Back to Copy Trader
            </Link>
          </div>
        </header>

        {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

        <form onSubmit={onSave} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 max-w-xl">
          <label className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <span>
              <p className="text-sm font-semibold text-slate-900">Emergency Kill Switch</p>
              <p className="text-xs text-slate-500">Immediately block new auto-copy executions.</p>
            </span>
            <input
              type="checkbox"
              checked={setting.killSwitchEnabled}
              onChange={(event) => setSetting((prev) => ({ ...prev, killSwitchEnabled: event.target.checked }))}
              className="h-4 w-4"
            />
          </label>

          <label className="block text-sm text-slate-700">
            Daily Loss Limit (USD)
            <input
              type="number"
              min="1"
              value={setting.dailyLossLimit}
              onChange={(event) => setSetting((prev) => ({ ...prev, dailyLossLimit: Number(event.target.value) }))}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm text-slate-700">
            Max Failed Executions Before Auto Stop
            <input
              type="number"
              min="1"
              max="50"
              value={setting.maxFailedExecs}
              onChange={(event) => setSetting((prev) => ({ ...prev, maxFailedExecs: Number(event.target.value) }))}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </main>
    </div>
  );
}
