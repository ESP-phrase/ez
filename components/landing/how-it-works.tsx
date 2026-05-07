import { Camera, Cpu, Trophy } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Camera,
    title: "Upload Screenshot",
    description: "Drop a screenshot of any prediction market from Polymarket, Kalshi, PredictIt — or anywhere else.",
    color: "text-blue-400",
    iconBg: "bg-blue-600/15 border-blue-400/25",
    glow: "shadow-blue-900/30",
    numColor: "text-blue-600/30",
    dot: "bg-blue-500",
  },
  {
    step: "02",
    icon: Cpu,
    title: "AI Analyzes",
    description: "Our model scans live news, historical data, and market microstructure to calculate your real edge.",
    color: "text-violet-400",
    iconBg: "bg-violet-600/15 border-violet-400/25",
    glow: "shadow-violet-900/30",
    numColor: "text-violet-600/30",
    dot: "bg-violet-500",
  },
  {
    step: "03",
    icon: Trophy,
    title: "Get Your Pick",
    description: "Receive a confidence score, risk assessment, entry price, and a clear exit strategy.",
    color: "text-amber-400",
    iconBg: "bg-amber-600/15 border-amber-400/25",
    glow: "shadow-amber-900/30",
    numColor: "text-amber-600/30",
    dot: "bg-amber-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-blue-400 font-semibold tracking-widest uppercase mb-3">
            How It Works
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Three steps to your{" "}
            <span className="text-gradient">winning edge</span>
          </h2>
          <p className="text-white/45 max-w-lg mx-auto text-sm leading-relaxed">
            No research required. Screenshot a market, let the AI work, and get a clear recommendation in under 10 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[33%] right-[33%] h-px bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-amber-500/30" />

          {steps.map((s) => (
            <div
              key={s.step}
              className={`surface-card rounded-2xl p-8 flex flex-col group hover:border-white/12 transition-all shadow-lg ${s.glow}`}
            >
              <div className={`text-4xl font-black mb-5 ${s.numColor} leading-none`}>{s.step}</div>

              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 border transition-all group-hover:scale-105 ${s.iconBg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>

              <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{s.description}</p>

              <div className={`mt-6 flex items-center gap-1.5 text-xs font-semibold ${s.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                Step {s.step}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
