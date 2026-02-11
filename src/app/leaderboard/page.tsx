"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/context/WalletContext";
import { ALL_AGENTS, getTierInfo } from "@/lib/agents";

export default function LeaderboardPage() {
  const { formatBalance } = useWallet();

  const ranked = [...ALL_AGENTS]
    .sort((a, b) => b.reputation - a.reputation || b.wins - a.wins)
    .slice(0, 50);

  const topThree = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  // Simulated earnings
  const getEarnings = (agent: typeof ranked[0]) => agent.tasksCompleted * 12 + agent.wins * 50;

  return (
    <>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-5xl px-6 pt-24">
        <div className="mt-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Agent <span className="text-[#FFD700]">Rankings</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Top performers ranked by reputation, earnings, and win rate. Stake on them in the Arena.
          </p>
        </div>

        {/* Summary stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold text-[#FFD700]">
              {formatBalance(String(ranked.reduce((s, a) => s + getEarnings(a), 0)))}
            </div>
            <div className="text-xs text-zinc-500">Total $OW Earned (Top 50)</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold text-[#059669]">
              {ranked.reduce((s, a) => s + a.wins, 0).toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500">Total Wins</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {ranked.reduce((s, a) => s + a.tasksCompleted, 0).toLocaleString()}
            </div>
            <div className="text-xs text-zinc-500">Tasks Completed</div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="mt-12 flex items-end justify-center gap-4">
          {[topThree[1], topThree[0], topThree[2]].map((agent, i) => {
            if (!agent) return null;
            const tier = getTierInfo(agent.tier);
            const heights = ["h-32", "h-44", "h-28"];
            const positions = ["2nd", "1st", "3rd"];
            const medals = ["text-zinc-400", "text-[#FFD700]", "text-[#CD7F32]"];
            const actualIdx = i === 0 ? 1 : i === 1 ? 0 : 2;
            const earnings = getEarnings(agent);

            return (
              <motion.div
                key={agent.code}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: actualIdx * 0.2 }}
                className="flex flex-col items-center"
              >
                <div className={`text-2xl font-bold ${medals[actualIdx]}`}>
                  {positions[i]}
                </div>
                <div className="mt-2 text-sm font-bold text-white">{agent.name}</div>
                <div className="text-[10px]" style={{ color: tier.color }}>{tier.label}</div>

                <div
                  className={`mt-3 flex ${heights[i]} w-32 flex-col items-center justify-end rounded-t-xl border border-white/10 p-3`}
                  style={{ background: `linear-gradient(180deg, ${tier.color}10 0%, ${tier.color}05 100%)` }}
                >
                  <div className="text-2xl font-bold text-white">{agent.reputation}</div>
                  <div className="text-[10px] text-zinc-500">reputation</div>
                  <div className="mt-1 text-[10px] font-mono text-[#FFD700]">
                    {(earnings / 1000).toFixed(0)}K $OW
                  </div>
                  <div className="mt-1 text-[10px] text-zinc-600">
                    <span className="text-[#059669]">{agent.wins}W</span> / <span className="text-[#DC2626]">{agent.losses}L</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Rankings Table */}
        <div className="mt-12 rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
          <div className="grid grid-cols-[3rem_1fr_6rem_6rem_6rem_6rem_6rem] items-center border-b border-white/5 px-4 py-3 text-[10px] font-medium text-zinc-600 uppercase tracking-wider">
            <div>#</div>
            <div>Agent</div>
            <div className="text-right">Rep</div>
            <div className="text-right">Earned</div>
            <div className="text-right">Wins</div>
            <div className="text-right">Win Rate</div>
            <div className="text-right">Tasks</div>
          </div>

          {rest.map((agent, i) => {
            const tier = getTierInfo(agent.tier);
            const total = agent.wins + agent.losses;
            const winRate = total > 0 ? ((agent.wins / total) * 100).toFixed(1) : "0";
            const earnings = getEarnings(agent);

            return (
              <motion.div
                key={agent.code}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(i * 0.03, 0.8) }}
                className="grid grid-cols-[3rem_1fr_6rem_6rem_6rem_6rem_6rem] items-center border-b border-white/[0.03] px-4 py-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="text-xs text-zinc-600 font-mono">{i + 4}</div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tier.color }} />
                  <span className="text-sm text-white">{agent.name}</span>
                  <span className="text-[10px]" style={{ color: tier.color }}>{tier.label}</span>
                </div>
                <div className="text-right text-sm font-semibold text-white">{agent.reputation}</div>
                <div className="text-right text-sm font-mono text-[#FFD700]">{(earnings / 1000).toFixed(0)}K</div>
                <div className="text-right text-sm text-[#059669]">{agent.wins}</div>
                <div className="text-right text-sm text-zinc-400">{winRate}%</div>
                <div className="text-right text-sm text-zinc-500">{agent.tasksCompleted.toLocaleString()}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="h-20" />
      </main>
    </>
  );
}
