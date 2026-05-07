import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function TestimonialCta() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-3xl mx-auto text-center">

        {/* Quote */}
        <div className="flex justify-center gap-0.5 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-blue-400 text-blue-400" />
          ))}
        </div>

        <blockquote className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-10 tracking-tight">
          &ldquo;Made back the $1 in the first 10 minutes. The AI flagged a mispriced market I&apos;d never have caught on my own.&rdquo;
        </blockquote>

        {/* Avatar + name */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-900/40">
              MT
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#040a14]" />
          </div>
          <div className="text-left">
            <p className="text-white font-bold text-base">Marcus T.</p>
            <p className="text-emerald-400 text-sm font-semibold">+$1,240 this month</p>
            <p className="text-white/30 text-xs">@sharpblocks · Verified trader</p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/start"
            className="group inline-flex items-center gap-2.5 px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-base hover:from-blue-500 hover:to-blue-400 transition-all shadow-xl shadow-blue-950/60 ring-1 ring-blue-400/25"
          >
            Start winning for $1
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="text-white/25 text-xs">First month $1 · Then $39/mo · Cancel anytime</p>
        </div>
      </div>
    </section>
  );
}
