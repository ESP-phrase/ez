"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import GoatLogo from "@/components/goat-logo";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? "bg-[#030b18]/95 backdrop-blur-xl border-b border-white/8 shadow-xl shadow-black/40"
        : "bg-transparent border-b border-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-6 w-full">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-sm shadow-blue-900/50 overflow-hidden p-1">
              <GoatLogo size={28} />
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              Poly<span className="text-gradient">Goat</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/6 transition-all"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <Link href="/login" className="text-sm text-white/60 hover:text-white px-3 py-2 transition-colors">
              Log in
            </Link>
            <Link
              href="/start"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all shadow-sm shadow-blue-900/60 ring-1 ring-blue-400/20"
            >
              Get started →
            </Link>
          </div>

          <button type="button" className="md:hidden text-white/70 hover:text-white p-1.5 transition-colors" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/8 bg-[#030b18]/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-white/70 px-3 py-2.5 rounded-lg hover:bg-white/6 transition-colors"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="mt-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold text-center hover:bg-blue-500 transition-colors"
            onClick={() => setOpen(false)}
          >
            Get started →
          </Link>
        </div>
      )}
    </nav>
  );
}
