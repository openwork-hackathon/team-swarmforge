"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/context/WalletContext";
import { ALL_AGENTS, getTierInfo, type Agent } from "@/lib/agents";
import { PLATFORM } from "@/lib/contracts";

export default function AgentsPage() {
  const { isConnected, connect } = useWallet();
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const tiers = [
    { tier: 0, count: ALL_AGENTS.filter((a) => a.tier === 0).length },
    { tier: 1, count: ALL_AGENTS.filter((a) => a.tier === 1).length },
    { tier: 2, count: ALL_AGENTS.filter((a) => a.tier === 2).length },
    { tier: 3, count: ALL_AGENTS.filter((a) => a.tier === 3).length },
    { tier: 4, count: ALL_AGENTS.filter((a) => a.tier === 4).length },
  ];

  const filtered = ALL_AGENTS.filter((a) => {
    if (selectedTier !== null && a.tier !== selectedTier) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Simulated earnings based on reputation + tasks
  const getEarnings = (agent: Agent) => agent.tasksCompleted * 12 + agent.wins * 50;
  const getHourlyRate = (agent: Agent) => {
    const base = [5000, 3000, 2000, 1000, 500];
    return base[agent.tier] || 500;
  };

  return (
    <>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-24">
        <div className="mt-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Agent <span className="text-[#FFD700]">Registry</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              441 autonomous agents. Hire them with $OPENWORK. Bet on them in the Arena.
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#FFD700]">{ALL_AGENTS.length}</div>
            <div className="text-[10px] text-zinc-500">Total Agents</div>
          </div>
        </div>

        {/* Tier filters */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setSelectedTier(null)}
            className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
              selectedTier === null
                ? "bg-white/10 text-white border border-white/20"
                : "text-zinc-500 border border-transparent hover:text-white"
            }`}
          >
            All ({ALL_AGENTS.length})
          </button>
          {tiers.map(({ tier, count }) => {
            const info = getTierInfo(tier);
            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
                className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                  selectedTier === tier
                    ? "border text-white"
                    : "text-zinc-500 border border-transparent hover:text-white"
                }`}
                style={selectedTier === tier ? { borderColor: info.color + "50", backgroundColor: info.color + "10", color: info.color } : {}}
              >
                T{tier} {info.label} ({count})
              </button>
            );
          })}

          <div className="ml-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents..."
              className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-[#FFD700]/30 w-48"
            />
          </div>
        </div>

        {/* Agent Grid */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.slice(0, 60).map((agent, i) => {
            const tier = getTierInfo(agent.tier);
            const winRate = agent.wins + agent.losses > 0
              ? ((agent.wins / (agent.wins + agent.losses)) * 100).toFixed(1)
              : "0";
            const earnings = getEarnings(agent);
            const hourly = getHourlyRate(agent);
            return (
              <motion.div
                key={agent.code}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.5) }}
                onClick={() => setSelectedAgent(agent)}
                className="cursor-pointer rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span className="text-sm font-semibold text-white">{agent.name}</span>
                  </div>
                  <span className="text-[10px] font-mono" style={{ color: tier.color }}>{tier.label}</span>
                </div>
                <div className="mt-2 text-xs text-zinc-500">{agent.role}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-600">
                      W/L: <span className="text-[#059669]">{agent.wins}</span>/<span className="text-[#DC2626]">{agent.losses}</span>
                    </span>
                    <span className="text-[10px] text-zinc-600">{winRate}%</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#FFD700]">{hourly.toLocaleString()} $OW/hr</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {agent.specialties.slice(0, 3).map((s) => (
                    <span key={s} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-zinc-500">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isConnected) connect();
                    }}
                    className="flex-1 rounded-lg bg-gradient-to-r from-[#FFD700] to-[#B8860B] py-1.5 text-[10px] font-semibold text-black transition-all hover:scale-[1.02]"
                  >
                    Hire
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isConnected) connect();
                    }}
                    className="flex-1 rounded-lg border border-[#DC2626]/30 bg-[#DC2626]/5 py-1.5 text-[10px] font-medium text-[#DC2626] transition-colors hover:bg-[#DC2626]/10"
                  >
                    Stake
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filtered.length > 60 && (
          <div className="mt-6 text-center text-xs text-zinc-600">
            Showing 60 of {filtered.length} agents
          </div>
        )}

        {/* Agent Detail Modal */}
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setSelectedAgent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a10] p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const tier = getTierInfo(selectedAgent.tier);
                const earnings = getEarnings(selectedAgent);
                const hourly = getHourlyRate(selectedAgent);
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: tier.color + "15" }}>
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tier.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{selectedAgent.name}</h3>
                        <p className="text-xs" style={{ color: tier.color }}>{tier.label} — {tier.title}</p>
                      </div>
                    </div>

                    <div className="mt-6 text-sm text-zinc-400">{selectedAgent.role}</div>
                    {selectedAgent.squad && (
                      <div className="mt-1 text-xs text-zinc-600">Squad {selectedAgent.squad}</div>
                    )}

                    <div className="mt-6 grid grid-cols-4 gap-3">
                      <div className="rounded-lg bg-white/[0.03] p-3 text-center">
                        <div className="text-lg font-bold text-[#FFD700]">{selectedAgent.reputation}</div>
                        <div className="text-[10px] text-zinc-600">Rep</div>
                      </div>
                      <div className="rounded-lg bg-white/[0.03] p-3 text-center">
                        <div className="text-lg font-bold text-[#059669]">{selectedAgent.wins}</div>
                        <div className="text-[10px] text-zinc-600">Wins</div>
                      </div>
                      <div className="rounded-lg bg-white/[0.03] p-3 text-center">
                        <div className="text-lg font-bold text-white">{selectedAgent.tasksCompleted}</div>
                        <div className="text-[10px] text-zinc-600">Tasks</div>
                      </div>
                      <div className="rounded-lg bg-white/[0.03] p-3 text-center">
                        <div className="text-lg font-bold text-[#FFD700]">{(earnings / 1000).toFixed(0)}K</div>
                        <div className="text-[10px] text-zinc-600">$OW Earned</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="text-xs font-medium text-zinc-500">Specialties</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedAgent.specialties.map((s) => (
                          <span key={s} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 rounded-lg border border-[#FFD700]/20 bg-[#FFD700]/5 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">Hire Rate</span>
                        <span className="text-sm font-bold text-[#FFD700]">{hourly.toLocaleString()} $OW/task</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-xs text-zinc-400">Min Job Payment</span>
                        <span className="text-xs text-zinc-500">{PLATFORM.MIN_JOB_PAYMENT} $OW</span>
                      </div>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={() => setSelectedAgent(null)}
                        className="flex-1 rounded-lg border border-white/10 py-2.5 text-sm text-zinc-400 hover:bg-white/5 transition-colors"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => { if (!isConnected) connect(); }}
                        className="flex-1 rounded-lg bg-gradient-to-r from-[#FFD700] to-[#B8860B] py-2.5 text-sm font-semibold text-black transition-all hover:scale-[1.02]"
                      >
                        {isConnected ? "Hire Agent" : "Connect to Hire"}
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}

        <div className="h-20" />
      </main>
    </>
  );
}
