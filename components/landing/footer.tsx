import Link from "next/link";
import { TrendingUp } from "lucide-react";

const links = {
  Features: ["AI Analyzer", "AI Coach", "Wallet Tracker", "Handpicked Picks"],
  Tools: ["Paper Trading", "Copy Trading", "Leaderboard", "Dashboard"],
  Company: ["Blog", "Pricing", "Terms", "Privacy"],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-4 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-400/25 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Poly<span className="text-gradient">Goat</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              AI-powered tools for smarter trading on Polymarket, Kalshi & more.
            </p>
          </div>

          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest mb-4">{cat}</p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <Link href="/login" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/20">© 2026 PolyGoat. All rights reserved.</p>
          <p className="text-xs text-white/20">PolyGoat never touches your funds. Trade responsibly.</p>
        </div>
      </div>
    </footer>
  );
}
