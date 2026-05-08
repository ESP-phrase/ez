import Image from "next/image";
import { Star, TrendingUp, DollarSign, BarChart2, Award } from "lucide-react";

const testimonials = [
  {
    name: "Marcus T.",
    handle: "@sharpblocks",
    photo: "https://i.pravatar.cc/150?u=sharpblocks42",
    text: "The AI flagged a mispriced election market I never would've caught on my own. PolyGoat surfaces opportunities I'd have completely missed.",
    badge: "AI Analyzer",
  },
  {
    name: "Priya K.",
    handle: "@priyatrades",
    photo: "https://i.pravatar.cc/150?u=priyatrades99",
    text: "Copy trading is a game changer. I set it to mirror top wallets and track exactly how the best traders are positioning — super useful.",
    badge: "Copy Trading",
  },
  {
    name: "James R.",
    handle: "@jrpoly",
    photo: "https://i.pravatar.cc/150?u=jrpoly17",
    text: "The daily analyst picks are well-reasoned and give me a solid starting point for my own research. Saves hours every morning.",
    badge: "Daily Picks",
  },
  {
    name: "Sofia M.",
    handle: "@sofiabets",
    photo: "https://i.pravatar.cc/150?u=sofiabets55",
    text: "Paper trading first gave me real confidence to understand markets before going live. The simulator is surprisingly realistic.",
    badge: "Paper Trading",
  },
  {
    name: "Derek W.",
    handle: "@derekw_pm",
    photo: "https://i.pravatar.cc/150?u=derekwpm83",
    text: "PolyGoat's confidence scores help me prioritize which markets are worth analyzing in depth. Much better signal-to-noise ratio.",
    badge: "AI Analyzer",
  },
  {
    name: "Aisha B.",
    handle: "@aisha_pmtrader",
    photo: "https://i.pravatar.cc/150?u=aishapmtrader61",
    text: "The AI surfaced a news event before the market had priced it in. That kind of edge in information is exactly what I was looking for.",
    badge: "BTC Edge",
  },
];

const stats = [
  { value: "300+", label: "Active Traders", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-400/20" },
  { value: "$4.2M+", label: "Tracked Volume", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-400/20" },
  { value: "<10s", label: "AI Analysis Time", icon: BarChart2, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-400/20" },
  { value: "4.9 / 5", label: "User Rating", icon: Award, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-400/20" },
];

export default function SocialProof() {
  return (
    <section className="py-28 px-4" id="picks">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-blue-400 font-semibold tracking-widest uppercase mb-3">
            Trader Results
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Traders love{" "}
            <span className="text-gradient">PolyGoat</span>
          </h2>
          <p className="text-white/45 max-w-lg mx-auto text-sm">
            See what prediction market traders are saying about our tools.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
          {stats.map((s) => (
            <div key={s.label} className={`surface-card rounded-2xl p-6 flex flex-col items-center gap-3 border ${s.bg}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-center">
                <div className={`text-2xl font-extrabold ${s.color} mb-0.5`}>{s.value}</div>
                <div className="text-xs text-white/35">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t) => (
            <div key={t.name} className="surface-card rounded-2xl p-6 flex flex-col gap-4 hover:border-white/12 transition-all">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/10 flex-shrink-0">
                    <Image
                      src={t.photo}
                      alt={t.name}
                      fill
                      sizes="36px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-white/30">{t.handle}</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 border border-blue-400/20 px-2 py-0.5 rounded-full">{t.badge}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
