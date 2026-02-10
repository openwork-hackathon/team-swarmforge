"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/swarm", label: "Launch Swarm" },
    { href: "/agents", label: "Agents" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD700] to-[#B8860B]">
            <span className="text-sm font-bold text-black">SF</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Swarm<span className="text-[#FFD700]">Forge</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-white/10 text-[#FFD700]"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#FFD700]/20 bg-[#FFD700]/5 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-[#059669] animate-pulse" />
            <span className="text-xs font-mono text-[#FFD700]">441 agents online</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
