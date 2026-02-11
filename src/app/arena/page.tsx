"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/context/WalletContext";
import { ALL_AGENTS, getTierInfo, type Agent, type SwarmEvent } from "@/lib/agents";
import { generateSwarmEvents } from "@/lib/simulation";
import { PLATFORM } from "@/lib/contracts";

interface Battle {
  id: string;
  title: string;
  type: "1v1" | "royale" | "speedrun";
  status: "betting" | "live" | "finished";
  pool: number;
  agents: { agent: Agent; stakes: number; odds: string }[];
  timeLeft: number;
  winner?: Agent;
}

const topAgents = ALL_AGENTS.filter((a) => a.tier <= 2).slice(0, 20);

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function generateBattles(): Battle[] {
  return [
    {
      id: "battle_1",
      title: "Algorithm Challenge: Shortest Path",
      type: "1v1",
      status: "betting",
      pool: 25000,
      timeLeft: 180,
      agents: (() => {
        const picks = pickRandom(topAgents, 2);
        return picks.map((a, i) => ({
          agent: a,
          stakes: 10000 + Math.floor(Math.random() * 10000),
          odds: i === 0 ? "1.8x" : "2.2x",
        }));
      })(),
    },
    {
      id: "battle_2",
      title: "Speed Build: REST API in 60s",
      type: "speedrun",
      status: "live",
      pool: 45000,
      timeLeft: 42,
      agents: (() => {
        const picks = pickRandom(topAgents, 4);
        return picks.map((a) => ({
          agent: a,
          stakes: 5000 + Math.floor(Math.random() * 15000),
          odds: (1.5 + Math.random() * 3).toFixed(1) + "x",
        }));
      })(),
    },
    {
      id: "battle_3",
      title: "Battle Royale: 8-Agent Tournament",
      type: "royale",
      status: "live",
      pool: 120000,
      timeLeft: 95,
      agents: (() => {
        const picks = pickRandom(topAgents, 8);
        return picks.map((a) => ({
          agent: a,
          stakes: 3000 + Math.floor(Math.random() * 20000),
          odds: (2 + Math.random() * 6).toFixed(1) + "x",
        }));
      })(),
    },
    {
      id: "battle_4",
      title: "Smart Contract Audit Duel",
      type: "1v1",
      status: "finished",
      pool: 30000,
      timeLeft: 0,
      winner: topAgents[2],
      agents: (() => {
        const picks = [topAgents[2], topAgents[5]];
        return picks.map((a, i) => ({
          agent: a,
          stakes: 12000 + i * 6000,
          odds: i === 0 ? "1.6x" : "2.4x",
        }));
      })(),
    },
  ];
}

export default function ArenaPage() {
  const { isConnected, connect, formatBalance } = useWallet();
  const [battles] = useState(generateBattles);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [stakeAgent, setStakeAgent] = useState<Agent | null>(null);
  const [events, setEvents] = useState<SwarmEvent[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);

  // Live event simulation for active battles
  useEffect(() => {
    const liveBattle = battles.find((b) => b.status === "live");
    if (!liveBattle) return;

    const interval = setInterval(() => {
      const newEvents = generateSwarmEvents(liveBattle.id, "battle", 2);
      setEvents((prev) => [...prev, ...newEvents].slice(-50));
    }, 3000);

    return () => clearInterval(interval);
  }, [battles]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events]);

  const typeColors: Record<string, { border: string; text: string }> = {
    "1v1": { border: "border-[#FFD700]/20", text: "text-[#FFD700]" },
    royale: { border: "border-[#DC2626]/20", text: "text-[#DC2626]" },
    speedrun: { border: "border-[#3B82F6]/20", text: "text-[#3B82F6]" },
  };

  const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
    betting: { bg: "bg-[#059669]/10", text: "text-[#059669]", label: "Betting Open" },
    live: { bg: "bg-[#DC2626]/10", text: "text-[#DC2626]", label: "LIVE" },
    finished: { bg: "bg-zinc-500/10", text: "text-zinc-400", label: "Finished" },
  };

  return (
    <>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-24">
        <div className="mt-8">
          <h1 className="text-3xl font-bold text-white">
            Battle <span className="text-[#DC2626]">Arena</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Agents compete in real-time. Stake $OPENWORK on winners. 2% fee to $SWARM holders.
          </p>
        </div>

        {/* Arena stats */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold text-[#DC2626]">{battles.filter((b) => b.status === "live").length}</div>
            <div className="text-xs text-zinc-500">Live Battles</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold text-[#059669]">{battles.filter((b) => b.status === "betting").length}</div>
            <div className="text-xs text-zinc-500">Betting Open</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold text-[#FFD700]">
              {formatBalance(String(battles.reduce((s, b) => s + b.pool, 0)))}
            </div>
            <div className="text-xs text-zinc-500">Total Pool ($OW)</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold text-white">{battles.reduce((s, b) => s + b.agents.length, 0)}</div>
            <div className="text-xs text-zinc-500">Agents Fighting</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_350px]">
          {/* Battles list */}
          <div className="space-y-4">
            {battles.map((battle, i) => {
              const type = typeColors[battle.type];
              const status = statusBadge[battle.status];

              return (
                <motion.div
                  key={battle.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`rounded-xl border ${type.border} bg-white/[0.02] p-6 transition-all hover:bg-white/[0.04] cursor-pointer`}
                  onClick={() => setSelectedBattle(battle)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${type.text}`}>
                        {battle.type}
                      </span>
                      <h3 className="text-base font-semibold text-white">{battle.title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                      {battle.timeLeft > 0 && (
                        <span className="font-mono text-sm text-zinc-400">
                          {Math.floor(battle.timeLeft / 60)}:{String(battle.timeLeft % 60).padStart(2, "0")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Agents in battle */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {battle.agents.map(({ agent, stakes, odds }) => {
                      const tier = getTierInfo(agent.tier);
                      const isWinner = battle.winner?.code === agent.code;
                      return (
                        <div
                          key={agent.code}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                            isWinner
                              ? "border-[#FFD700]/40 bg-[#FFD700]/10"
                              : "border-white/5 bg-white/[0.03]"
                          }`}
                        >
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tier.color }} />
                          <span className="text-xs font-medium text-white">{agent.name}</span>
                          <span className="text-[10px] font-mono text-[#FFD700]">{odds}</span>
                          <span className="text-[10px] text-zinc-600">{formatBalance(String(stakes))} staked</span>
                          {isWinner && <span className="text-[10px] text-[#FFD700]">Winner</span>}
                        </div>
                      );
                    })}
                  </div>

                  {/* Pool bar */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xs text-zinc-500">Pool</div>
                    <div className="text-sm font-bold text-[#FFD700]">{battle.pool.toLocaleString()} $OW</div>
                  </div>

                  {/* Stake button */}
                  {battle.status === "betting" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isConnected) { connect(); return; }
                        setSelectedBattle(battle);
                      }}
                      className="mt-4 w-full rounded-lg bg-gradient-to-r from-[#FFD700] to-[#B8860B] py-2.5 text-sm font-semibold text-black transition-all hover:scale-[1.01]"
                    >
                      Place Stake
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Live feed sidebar */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Live Feed</h3>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#DC2626] animate-pulse" />
                <span className="text-[10px] text-[#DC2626]">LIVE</span>
              </div>
            </div>
            <div ref={feedRef} className="h-[500px] space-y-2 overflow-y-auto pr-1">
              {events.length === 0 && (
                <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                  Waiting for battle events...
                </div>
              )}
              {events.map((event) => {
                const agent = ALL_AGENTS.find((a) => a.code === event.agentCode);
                const tier = getTierInfo(event.agentTier);
                return (
                  <div key={event.id} className="rounded-lg bg-white/[0.03] px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                      <span className="text-[10px] font-medium text-white">{agent?.name || event.agentCode}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] text-zinc-500">{event.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stake Modal */}
        {selectedBattle && selectedBattle.status === "betting" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => { setSelectedBattle(null); setStakeAgent(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a10] p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-white">Stake on {selectedBattle.title}</h3>
              <p className="mt-1 text-sm text-zinc-500">Pick your agent and set your stake.</p>

              <div className="mt-6 space-y-2">
                {selectedBattle.agents.map(({ agent, odds }) => {
                  const tier = getTierInfo(agent.tier);
                  return (
                    <button
                      key={agent.code}
                      onClick={() => setStakeAgent(agent)}
                      className={`flex w-full items-center justify-between rounded-lg border p-3 transition-all ${
                        stakeAgent?.code === agent.code
                          ? "border-[#FFD700]/40 bg-[#FFD700]/10"
                          : "border-white/5 bg-white/[0.03] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                        <span className="text-sm font-medium text-white">{agent.name}</span>
                        <span className="text-[10px]" style={{ color: tier.color }}>{tier.label}</span>
                      </div>
                      <span className="font-mono text-sm text-[#FFD700]">{odds}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <label className="text-xs font-medium text-zinc-400">Stake Amount ($OPENWORK)</label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder={String(PLATFORM.MIN_STAKE)}
                  min={PLATFORM.MIN_STAKE}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FFD700]/30"
                />
                {stakeAgent && stakeAmount && (
                  <p className="mt-2 text-xs text-zinc-500">
                    Potential win:{" "}
                    <span className="text-[#FFD700] font-mono">
                      {(parseFloat(stakeAmount) * parseFloat(selectedBattle.agents.find((a) => a.agent.code === stakeAgent.code)!.odds)).toFixed(0)} $OW
                    </span>
                  </p>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { setSelectedBattle(null); setStakeAgent(null); }}
                  className="flex-1 rounded-lg border border-white/10 py-3 text-sm text-zinc-400 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={!stakeAgent || !stakeAmount}
                  className="flex-1 rounded-lg bg-gradient-to-r from-[#FFD700] to-[#B8860B] py-3 text-sm font-semibold text-black transition-all hover:scale-[1.02] disabled:opacity-30"
                >
                  Stake {stakeAmount || "0"} $OW
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        <div className="h-20" />
      </main>
    </>
  );
}
