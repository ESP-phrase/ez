"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Trophy,
  ScanSearch,
  Copy,
  Zap,
  TestTube2,
  LogOut,
} from "lucide-react";
import GoatLogo from "@/components/goat-logo";

const navItems = [
  {
    icon: ScanSearch,
    label: "AI Analyzer",
    href: "/dashboard/analyzer",
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-blue-500/40",
    activeBg: "bg-gradient-to-r from-blue-600 to-cyan-600",
    hoverText: "text-blue-400",
  },
  {
    icon: Copy,
    label: "Copy Trader",
    href: "/dashboard/copy-trading",
    gradient: "from-indigo-500 to-violet-500",
    glow: "shadow-indigo-500/40",
    activeBg: "bg-gradient-to-r from-indigo-600 to-violet-600",
    hoverText: "text-indigo-400",
  },
  {
    icon: Zap,
    label: "BTC Edge",
    href: "/dashboard/btc-edge",
    gradient: "from-violet-500 to-purple-500",
    glow: "shadow-violet-500/40",
    activeBg: "bg-gradient-to-r from-violet-600 to-purple-600",
    hoverText: "text-violet-400",
  },
  {
    icon: TestTube2,
    label: "BTC Backtest",
    href: "/dashboard/btc-edge/backtest",
    gradient: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/40",
    activeBg: "bg-gradient-to-r from-emerald-600 to-teal-600",
    hoverText: "text-emerald-400",
  },
  {
    icon: Trophy,
    label: "Leaderboard",
    href: "/dashboard",
    gradient: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/40",
    activeBg: "bg-gradient-to-r from-amber-500 to-orange-500",
    hoverText: "text-amber-400",
  },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("pg_auth");
    localStorage.removeItem("pg_user");
    router.push("/login");
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[#080e1a] border-r border-white/8 px-3 py-5 gap-4">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 hover:bg-white/8 transition-all"
      >
        <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden p-0.5 flex-shrink-0">
          <GoatLogo size={26} />
        </span>
        <span>
          <span className="block text-sm font-bold text-white">PolyGoat</span>
          <span className="block text-[11px] text-white/40">Trader workspace</span>
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 w-full">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group w-full rounded-xl flex items-center gap-3 px-3 py-2.5 transition-all duration-200 ${
                active
                  ? `${item.activeBg} shadow-lg ${item.glow}`
                  : "hover:bg-white/6"
              }`}
            >
              <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:-translate-y-1 group-hover:scale-110 ${
                active
                  ? "bg-white/20"
                  : `bg-gradient-to-br ${item.gradient} opacity-80 group-hover:opacity-100 shadow-md ${item.glow}`
              }`}>
                <item.icon className="w-4 h-4 text-white" />
              </span>
              <span className={`text-sm font-medium transition-colors duration-200 ${
                active ? "text-white" : `text-white/50 group-hover:${item.hoverText}`
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="group w-full rounded-xl flex items-center gap-3 px-3 py-2.5 hover:bg-rose-500/10 transition-all"
      >
        <span className="w-8 h-8 rounded-lg bg-white/6 group-hover:bg-rose-500/20 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:-translate-y-1 group-hover:scale-110">
          <LogOut className="w-4 h-4 text-white/30 group-hover:text-rose-400 transition-colors" />
        </span>
        <span className="text-sm font-medium text-white/30 group-hover:text-rose-400 transition-colors">Logout</span>
      </button>
    </aside>
  );
}
