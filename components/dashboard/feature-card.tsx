import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: "indigo" | "violet" | "slate" | "cyan";
  size?: "large" | "medium";
}

const colorMap = {
  indigo: {
    iconBg: "bg-blue-50 border-blue-200",
    iconText: "text-blue-700",
    border: "border-blue-200 hover:border-blue-300",
    bg: "from-blue-50",
  },
  violet: {
    iconBg: "bg-indigo-50 border-indigo-200",
    iconText: "text-indigo-700",
    border: "border-indigo-200 hover:border-indigo-300",
    bg: "from-indigo-50",
  },
  slate: {
    iconBg: "bg-slate-100 border-slate-200",
    iconText: "text-slate-700",
    border: "border-slate-200 hover:border-slate-300",
    bg: "from-slate-50",
  },
  cyan: {
    iconBg: "bg-cyan-50 border-cyan-200",
    iconText: "text-cyan-700",
    border: "border-cyan-200 hover:border-cyan-300",
    bg: "from-cyan-50",
  },
};

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
  color,
  size = "medium",
}: FeatureCardProps) {
  const c = colorMap[color];

  return (
    <Link
      href={href}
      className={`rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} to-white p-6 flex flex-col gap-4 hover:shadow-md transition-all group`}
    >
      <div
        className={`w-11 h-11 rounded-xl border flex items-center justify-center ${c.iconBg} group-hover:scale-105 transition-transform`}
      >
        <Icon className={c.iconText} style={{ width: size === "large" ? 22 : 18, height: size === "large" ? 22 : 18 }} />
      </div>
      <div>
        <h3 className={`font-bold text-slate-900 mb-1 tracking-tight ${size === "large" ? "text-xl" : "text-sm"}`}>
          {title}
        </h3>
        <p className="text-slate-600 text-xs leading-relaxed">{description}</p>
      </div>
    </Link>
  );
}
