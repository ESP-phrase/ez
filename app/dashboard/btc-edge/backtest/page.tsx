"use client";

import Link from "next/link";
import { ChevronLeft, FlaskConical, Clock } from "lucide-react";
import Sidebar from "@/components/dashboard/sidebar";

export default function BacktestPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center px-8 py-4 border-b border-slate-200 sticky top-0 z-30 bg-slate-50/95 backdrop-blur gap-3">
          <Link
            href="/dashboard/btc-edge"
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            BTC Edge
          </Link>
          <span className="text-slate-200">/</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center">
              <FlaskConical className="w-3 h-3 text-indigo-600" />
            </div>
            <p className="text-sm font-semibold text-slate-900">Strategy Backtest</p>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-200 flex items-center justify-center">
            <Clock className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Coming Soon</h1>
            <p className="text-sm text-slate-500 mt-2 max-w-sm">
              The BTC strategy backtester is currently being rebuilt with improved accuracy and more indicators. Check back soon.
            </p>
          </div>
          <Link
            href="/dashboard/btc-edge"
            className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all"
          >
            Back to BTC Edge
          </Link>
        </main>
      </div>
    </div>
  );
}
