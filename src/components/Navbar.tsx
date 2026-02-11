"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@/context/WalletContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/marketplace", label: "Hire" },
  { href: "/arena", label: "Arena" },
  { href: "/agents", label: "Agents" },
  { href: "/leaderboard", label: "Rankings" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { address, isConnected, isConnecting, connect, disconnect, openworkBalance, swarmBalance, formatBalance } = useWallet();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD700] to-[#B8860B]">
            <span className="text-xs font-black text-black">SF</span>
          </div>
          <span className="text-sm font-bold text-white">SwarmForge</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                pathname === link.href
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-[#FFD700]/20 bg-[#FFD700]/5 px-2.5 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#FFD700]" />
                  <span className="text-[11px] font-mono text-[#FFD700]">
                    {formatBalance(openworkBalance)} OW
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg border border-[#059669]/20 bg-[#059669]/5 px-2.5 py-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                  <span className="text-[11px] font-mono text-[#059669]">
                    {formatBalance(swarmBalance)} SWARM
                  </span>
                </div>
              </div>
              <button
                onClick={disconnect}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-mono text-zinc-400 transition-colors hover:border-red-500/30 hover:text-red-400"
              >
                {address!.slice(0, 6)}...{address!.slice(-4)}
              </button>
            </>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="rounded-lg bg-gradient-to-r from-[#FFD700] to-[#B8860B] px-4 py-1.5 text-xs font-semibold text-black transition-all hover:scale-105 disabled:opacity-50"
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
