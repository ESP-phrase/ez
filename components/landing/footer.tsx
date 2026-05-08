import Link from "next/link";
import { TrendingUp } from "lucide-react";

const links: Record<string, { label: string; href: string }[]> = {
  Features: [
    { label: "AI Analyzer", href: "/dashboard" },
    { label: "BTC Edge", href: "/dashboard/btc-edge" },
    { label: "Copy Trading", href: "/dashboard/copy-trading" },
    { label: "Paper Trading", href: "/dashboard/paper-trading" },
  ],
  Tools: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Start for $1", href: "/start" },
    { label: "Login", href: "/login" },
    { label: "Account", href: "/dashboard/settings" },
  ],
  Company: [
    { label: "Pricing", href: "/#pricing" },
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "Contact", href: "mailto:support@polygoat.io" },
  ],
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
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-white/40 hover:text-white/70 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-7 flex flex-col gap-4">
          <p className="text-[11px] text-white/20 leading-relaxed max-w-4xl">
            <strong className="text-white/30">Risk Disclaimer:</strong> Prediction market trading involves risk and is not suitable for everyone. Past performance of any analysis, picks, or signals is not indicative of future results. PolyGoat provides informational tools only and does not constitute financial, investment, or trading advice. Always trade responsibly and only with funds you can afford to lose.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/20">© 2026 PolyGoat. All rights reserved.</p>
            <p className="text-xs text-white/20">PolyGoat never touches your funds. For informational purposes only.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
