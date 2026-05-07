import Link from "next/link";
import { LucideIcon, ChevronRight } from "lucide-react";

interface ListItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badgeLabel: string;
  badgeColor: "indigo" | "violet" | "cyan" | "slate";
  href: string;
}

const badgeMap = {
  indigo: "bg-blue-50 text-blue-700 border-blue-200",
  violet: "bg-indigo-50 text-indigo-700 border-indigo-200",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function ListItem({
  icon: Icon,
  title,
  description,
  badgeLabel,
  badgeColor,
  href,
}: ListItemProps) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 hover:border-blue-300 px-5 py-3.5 flex items-center gap-4 group transition-all bg-white hover:shadow-sm"
    >
      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
        <Icon style={{ width: 14, height: 14 }} className="text-slate-600" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 truncate">{description}</p>
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0">
        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${badgeMap[badgeColor]}`}>
          {badgeLabel}
        </span>
        <ChevronRight style={{ width: 14, height: 14 }} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
    </Link>
  );
}
