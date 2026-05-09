import Link from "next/link";
import {
  ScanSearch,
  CalendarCheck,
  Copy,
  FlaskConical,
  ArrowRight,
  BarChart2,
  AlertTriangle,
  LogOut,
  Zap,
  ShieldCheck,
  PauseCircle,
  Check,
} from "lucide-react";

const features = [
  {
    id: "analyzer",
    tag: "AI Market Analyzer",
    headline: "Screenshot any market.\nGet your edge instantly.",
    sub: "Drop a screenshot and let our AI surface insights a researcher would take hours to find.",
    bullets: [
      { icon: ScanSearch, text: "Works on Polymarket, Kalshi, PredictIt & more" },
      { icon: BarChart2, text: "Confidence scores, risk flags, and exit plans" },
      { icon: AlertTriangle, text: "Live news scans power every analysis" },
    ],
    cta: "Try the Analyzer",
    href: "/login",
    accent: "blue",
    iconBg: "bg-blue-600",
    border: "border-blue-500/20",
    cardBg: "from-blue-950/50 via-[#080e1c] to-[#060c18]",
    tagStyle: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    btnStyle: "bg-blue-600 hover:bg-blue-500 shadow-blue-900/40",
    bulletColor: "text-blue-400",
    Icon: ScanSearch,
    glow: "rgba(37,99,235,0.15)",
  },
  {
    id: "picks",
    tag: "Daily AI Picks",
    headline: "Expert picks,\nupdated every morning.",
    sub: "Curated picks from analysts with documented track records. Skip the noise, trade with conviction.",
    bullets: [
      { icon: CalendarCheck, text: "Reviewed and published daily by our team" },
      { icon: Zap, text: "Entry price, recommendation, and reasoning included" },
      { icon: BarChart2, text: "Fully auditable, time-stamped track record" },
    ],
    cta: "See Today's Picks",
    href: "/login",
    accent: "cyan",
    iconBg: "bg-cyan-600",
    border: "border-cyan-500/20",
    cardBg: "from-cyan-950/40 via-[#060d14] to-[#060c18]",
    tagStyle: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    btnStyle: "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-900/40",
    bulletColor: "text-cyan-400",
    Icon: CalendarCheck,
    glow: "rgba(8,145,178,0.12)",
  },
  {
    id: "copy",
    tag: "Copy Trading",
    headline: "Mirror the sharpest\nwallets automatically.",
    sub: "Connect your API keys, pick a top trader, and let the bot replicate positions in real time.",
    bullets: [
      { icon: Copy, text: "Same markets, same timing — scaled to your budget" },
      { icon: PauseCircle, text: "Set risk limits. Pause or stop at any moment" },
      { icon: ShieldCheck, text: "Read-only keys — we can never touch your funds" },
    ],
    cta: "Start Copy Trading",
    href: "/login",
    accent: "violet",
    iconBg: "bg-violet-600",
    border: "border-violet-500/20",
    cardBg: "from-violet-950/40 via-[#0a080e] to-[#060c18]",
    tagStyle: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    btnStyle: "bg-violet-600 hover:bg-violet-500 shadow-violet-900/40",
    bulletColor: "text-violet-400",
    Icon: Copy,
    glow: "rgba(124,58,237,0.12)",
  },
  {
    id: "paper",
    tag: "Paper Trading",
    headline: "Practice risk-free\nbefore going live.",
    sub: "Simulate real trades with virtual funds. Build confidence and understand markets before going live.",
    bullets: [
      { icon: FlaskConical, text: "Live Polymarket events, virtual balance" },
      { icon: BarChart2, text: "Full P&L dashboard and open positions" },
      { icon: LogOut, text: "One-click switch to live when you're ready" },
    ],
    cta: "Start Paper Trading",
    href: "/login",
    accent: "emerald",
    iconBg: "bg-emerald-600",
    border: "border-emerald-500/20",
    cardBg: "from-emerald-950/40 via-[#060e0a] to-[#060c18]",
    tagStyle: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    btnStyle: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40",
    bulletColor: "text-emerald-400",
    Icon: FlaskConical,
    glow: "rgba(5,150,105,0.12)",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-blue-400 font-semibold tracking-widest uppercase mb-3">Features</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Every edge you need,{" "}
            <span className="text-gradient">in one place</span>
          </h2>
          <p className="text-white/45 max-w-lg mx-auto text-sm">
            Four powerful tools working together to help you trade smarter on prediction markets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f) => (
            <div
              key={f.id}
              className={`relative rounded-2xl border ${f.border} bg-gradient-to-br ${f.cardBg} overflow-hidden group hover:border-opacity-40 transition-all`}
              style={{ boxShadow: `0 20px 60px ${f.glow}` }}
            >
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30 ${f.bulletColor}`} />

              <div className="p-8 flex flex-col h-full gap-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-bold tracking-widest uppercase mb-3 ${f.tagStyle}`}>
                      {f.tag}
                    </span>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white leading-snug whitespace-pre-line">
                      {f.headline}
                    </h3>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl ${f.iconBg} flex items-center justify-center flex-shrink-0 ml-4 shadow-lg`}>
                    <f.Icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Sub */}
                <p className="text-white/45 text-sm leading-relaxed -mt-2">{f.sub}</p>

                {/* Bullets */}
                <ul className="space-y-3">
                  {f.bullets.map((b) => (
                    <li key={b.text} className="flex items-start gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-white/5 border border-white/10`}>
                        <Check className={`w-3 h-3 ${f.bulletColor}`} />
                      </span>
                      <span className="text-white/60 text-sm leading-relaxed">{b.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-auto pt-2">
                  <Link
                    href={f.href}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all shadow-md ${f.btnStyle}`}
                  >
                    {f.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
