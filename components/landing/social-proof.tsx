import Image from "next/image";
import { Star, TrendingUp, DollarSign, BarChart2, Award } from "lucide-react";

const testimonials = [
  {
    name: "Marcus T.",
    handle: "@sharpblocks",
    photo: "https://i.pravatar.cc/150?u=sharpblocks42",
    text: "Made back my subscription in the first day. The AI flagged a mispriced election market I never would've caught on my own.",
    profit: "+$1,240",
  },
  {
    name: "Priya K.",
    handle: "@priyatrades",
    photo: "https://i.pravatar.cc/150?u=priyatrades99",
    text: "Copy trading is a game changer. I set it to mirror two top wallets and just let it run. Up 34% this month with zero effort.",
    profit: "+$890",
  },
  {
    name: "James R.",
    handle: "@jrpoly",
    photo: "https://i.pravatar.cc/150?u=jrpoly17",
    text: "The daily picks alone are worth the subscription. 7 out of 10 winners this week — nothing else comes close to this accuracy.",
    profit: "+$2,100",
  },
  {
    name: "Sofia M.",
    handle: "@sofiabets",
    photo: "https://i.pravatar.cc/150?u=sofiabets55",
    text: "Paper trading first gave me real confidence. Two weeks in simulation, then went live and hit three consecutive winners.",
    profit: "+$430",
  },
  {
    name: "Derek W.",
    handle: "@derekw_pm",
    photo: "https://i.pravatar.cc/150?u=derekwpm83",
    text: "PolyGoat's confidence scores are eerily accurate. I only bet above 75% confidence now and my win rate speaks for itself.",
    profit: "+$3,650",
  },
  {
    name: "Aisha B.",
    handle: "@aisha_pmtrader",
    photo: "https://i.pravatar.cc/150?u=aishapmtrader61",
    text: "Was skeptical. Then the AI surfaced a news event before the market moved. That single trade covered 6 months of the subscription.",
    profit: "+$780",
  },
];

const stats = [
  { value: "300+", label: "Active Traders", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-400/20" },
  { value: "$4.2M+", label: "Profits Generated", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-400/20" },
  { value: "73%", label: "Avg Win Rate", icon: BarChart2, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-400/20" },
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
            Traders are winning{" "}
            <span className="text-gradient">every day</span>
          </h2>
          <p className="text-white/45 max-w-lg mx-auto text-sm">
            Real results from real traders. No cherry-picking — these are from our verified user base.
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
                <span className="text-xs font-bold text-emerald-400">{t.profit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
