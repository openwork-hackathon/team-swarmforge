"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SwarmCanvas from "@/components/SwarmCanvas";
import Navbar from "@/components/Navbar";
import { ALL_AGENTS, getTierInfo, type SwarmEvent, SQUADS } from "@/lib/agents";
import { generateSwarmEvents, simulateProductBuild, CHALLENGE_TEMPLATES } from "@/lib/simulation";

type Tab = "build" | "battle";

export default function SwarmPage() {
  const [tab, setTab] = useState<Tab>("build");
  const [prompt, setPrompt] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<SwarmEvent[]>([]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [phases, setPhases] = useState<ReturnType<typeof simulateProductBuild>["phases"]>([]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [totalAgents, setTotalAgents] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // Auto-scroll feed
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [events]);

  // Timer
  useEffect(() => {
    if (isRunning) {
      const start = Date.now();
      timerRef.current = setInterval(() => setElapsed(Date.now() - start), 100);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const launchSwarm = () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setEvents([]);
    setCurrentPhase(0);
    setCompletedTasks(new Set());
    setElapsed(0);

    const sim = simulateProductBuild(prompt);
    setPhases(sim.phases);
    setTotalAgents(sim.totalAgents);

    // Simulate phases
    let phaseIdx = 0;
    const runPhase = () => {
      if (phaseIdx >= sim.phases.length) {
        setIsRunning(false);
        setEvents((prev) => [
          ...prev,
          {
            id: `evt_done`,
            timestamp: Date.now(),
            agentCode: "GENESIS",
            agentTier: 0,
            action: "DEPLOYMENT COMPLETE",
            detail: `Product "${prompt.slice(0, 40)}..." shipped to production. All 7 squads delivered.`,
            challengeId: "build",
          },
        ]);
        return;
      }

      setCurrentPhase(phaseIdx);
      const phase = sim.phases[phaseIdx];

      // Generate events for this phase
      let taskIdx = 0;
      const taskInterval = setInterval(() => {
        if (taskIdx >= phase.tasks.length) {
          clearInterval(taskInterval);
          setCompletedTasks((prev) => new Set([...prev, `${phaseIdx}`]));
          phaseIdx++;
          setTimeout(runPhase, 500);
          return;
        }

        const newEvents = generateSwarmEvents("build", "build", 2);
        // Override one event with the actual phase task
        if (newEvents.length > 0) {
          newEvents[0].detail = phase.tasks[taskIdx];
          newEvents[0].action = phase.name;
        }
        setEvents((prev) => [...prev, ...newEvents]);
        taskIdx++;
      }, 1200);
    };

    // Kick off with GENESIS decomposition event
    setEvents([
      {
        id: "evt_start",
        timestamp: Date.now(),
        agentCode: "GENESIS",
        agentTier: 0,
        action: "SWARM ACTIVATED",
        detail: `Orchestrating 441 agents for: "${prompt.slice(0, 60)}..."`,
        challengeId: "build",
      },
    ]);
    setTimeout(runPhase, 1500);
  };

  const launchBattle = () => {
    if (isRunning) return;
    setIsRunning(true);
    setEvents([]);
    setElapsed(0);

    const fighters = ALL_AGENTS.filter((a) => a.tier <= 2).slice(0, 8);
    let round = 1;
    let remaining = [...fighters];

    setEvents([
      {
        id: "evt_battle_start",
        timestamp: Date.now(),
        agentCode: "GENESIS",
        agentTier: 0,
        action: "BATTLE ROYALE",
        detail: `${remaining.length} agents enter the arena. Only one survives.`,
        challengeId: "battle",
      },
    ]);

    const runRound = () => {
      if (remaining.length <= 1) {
        setIsRunning(false);
        setEvents((prev) => [
          ...prev,
          {
            id: `evt_winner`,
            timestamp: Date.now(),
            agentCode: remaining[0]?.code || "GENESIS",
            agentTier: remaining[0]?.tier || 0,
            action: "CHAMPION",
            detail: `${remaining[0]?.name || "Genesis"} wins the Battle Royale! Reputation +50.`,
            challengeId: "battle",
          },
        ]);
        return;
      }

      // Each remaining agent "competes"
      let idx = 0;
      const fightInterval = setInterval(() => {
        if (idx >= remaining.length) {
          clearInterval(fightInterval);
          // Eliminate weakest
          const eliminated = remaining.reduce((min, a) =>
            a.reputation + Math.random() * 20 < min.reputation + Math.random() * 20 ? a : min
          );
          remaining = remaining.filter((a) => a.code !== eliminated.code);

          setEvents((prev) => [
            ...prev,
            {
              id: `evt_elim_${round}`,
              timestamp: Date.now(),
              agentCode: eliminated.code,
              agentTier: eliminated.tier,
              action: "ELIMINATED",
              detail: `${eliminated.name} is eliminated in round ${round}. ${remaining.length} agents remain.`,
              challengeId: "battle",
            },
          ]);

          round++;
          setTimeout(runRound, 2000);
          return;
        }

        const agent = remaining[idx];
        const battleEvents = generateSwarmEvents("battle", "battle", 1);
        battleEvents[0].agentCode = agent.code;
        battleEvents[0].agentTier = agent.tier;
        battleEvents[0].detail = `${agent.name} executing round ${round} strategy — score: ${(70 + Math.random() * 30).toFixed(1)}`;
        setEvents((prev) => [...prev, ...battleEvents]);
        idx++;
      }, 800);
    };

    setTimeout(runRound, 2000);
  };

  return (
    <>
      <SwarmCanvas particleCount={80} active={isRunning} />
      <Navbar />

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-24">
        {/* Mode Tabs */}
        <div className="mt-8 flex items-center gap-2">
          <button
            onClick={() => setTab("build")}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
              tab === "build"
                ? "bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/30"
                : "text-zinc-500 hover:text-white border border-transparent"
            }`}
          >
            Product Factory
          </button>
          <button
            onClick={() => setTab("battle")}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
              tab === "battle"
                ? "bg-[#DC2626]/10 text-[#DC2626] border border-[#DC2626]/30"
                : "text-zinc-500 hover:text-white border border-transparent"
            }`}
          >
            Agent Arena
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main Panel */}
          <div className="space-y-6">
            {/* Input */}
            {tab === "build" ? (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                <label className="text-sm font-medium text-zinc-400">Describe a product to build</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. A real-time collaborative whiteboard with AI drawing assistance, user authentication, and room sharing..."
                  rows={3}
                  className="mt-3 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FFD700]/30 resize-none"
                />
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    {["Chat App", "DeFi Dashboard", "AI Tool"].map((quick) => (
                      <button
                        key={quick}
                        onClick={() => setPrompt(CHALLENGE_TEMPLATES.find((t) => t.title.includes(quick.split(" ")[0]))?.description || quick)}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-500 hover:border-white/20 hover:text-white transition-colors"
                      >
                        {quick}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={launchSwarm}
                    disabled={isRunning || !prompt.trim()}
                    className="rounded-lg bg-gradient-to-r from-[#FFD700] to-[#B8860B] px-6 py-2.5 text-sm font-semibold text-black transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {isRunning ? "Building..." : "Launch Swarm"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                <h3 className="text-sm font-medium text-zinc-400">Battle Royale</h3>
                <p className="mt-2 text-xs text-zinc-600">
                  8 top agents enter. Each round they solve a challenge. Lowest score gets eliminated. Last one standing wins.
                </p>
                <button
                  onClick={launchBattle}
                  disabled={isRunning}
                  className="mt-4 rounded-lg bg-gradient-to-r from-[#DC2626] to-[#991B1B] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-40"
                >
                  {isRunning ? "Fighting..." : "Start Battle Royale"}
                </button>
              </div>
            )}

            {/* Live Feed */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${isRunning ? "bg-[#059669] animate-pulse" : "bg-zinc-600"}`} />
                  <span className="text-sm font-medium text-zinc-300">Live Feed</span>
                </div>
                {isRunning && (
                  <span className="font-mono text-xs text-[#FFD700]">
                    {(elapsed / 1000).toFixed(1)}s
                  </span>
                )}
              </div>

              <div ref={feedRef} className="h-[400px] overflow-y-auto p-4 space-y-2">
                <AnimatePresence>
                  {events.map((event) => {
                    const tier = getTierInfo(event.agentTier);
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 rounded-lg border border-white/5 bg-white/[0.01] px-4 py-3"
                      >
                        <div
                          className="mt-1 h-2 w-2 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: tier.color }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold" style={{ color: tier.color }}>
                              {event.agentCode}
                            </span>
                            <span className="text-[10px] text-zinc-600">{tier.label}</span>
                            <span className="text-[10px] text-zinc-700">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="mt-0.5 text-xs text-zinc-500">{event.action}</div>
                          <div className="mt-1 text-sm text-zinc-300">{event.detail}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {events.length === 0 && (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-700">
                    {tab === "build" ? "Describe a product and launch the swarm..." : "Start a battle royale..."}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Phase Progress (Build mode) */}
            {tab === "build" && phases.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h3 className="text-sm font-medium text-zinc-300">Sprint Progress</h3>
                <div className="mt-4 space-y-3">
                  {phases.map((phase, i) => {
                    const done = completedTasks.has(`${i}`);
                    const active = currentPhase === i && isRunning;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                          done ? "bg-[#059669] text-white" :
                          active ? "bg-[#FFD700] text-black animate-pulse" :
                          "bg-white/5 text-zinc-600"
                        }`}>
                          {done ? "✓" : i + 1}
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-medium ${done ? "text-[#059669]" : active ? "text-[#FFD700]" : "text-zinc-500"}`}>
                            {phase.name}
                          </div>
                          <div className="text-[10px] text-zinc-700">{phase.squad} — {phase.duration}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Active Agents */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h3 className="text-sm font-medium text-zinc-300">Active Agents</h3>
              <div className="mt-1 text-xs text-zinc-600">{isRunning ? totalAgents || 8 : 0} / 441 deployed</div>
              <div className="mt-4 space-y-2">
                {(isRunning ? ALL_AGENTS.slice(0, 12) : ALL_AGENTS.slice(0, 6)).map((agent) => {
                  const tier = getTierInfo(agent.tier);
                  return (
                    <div key={agent.code} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                        <span className="text-xs text-zinc-400">{agent.name}</span>
                      </div>
                      <span className={`text-[10px] ${isRunning ? "text-[#059669]" : "text-zinc-700"}`}>
                        {isRunning ? "working" : "idle"}
                      </span>
                    </div>
                  );
                })}
                {isRunning && (
                  <div className="text-[10px] text-zinc-600 pt-1">
                    + {(totalAgents || 8) - 12} more agents...
                  </div>
                )}
              </div>
            </div>

            {/* Squad Status */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h3 className="text-sm font-medium text-zinc-300">Squad Status</h3>
              <div className="mt-4 space-y-3">
                {SQUADS.map((squad) => (
                  <div key={squad.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: squad.color }} />
                      <span className="text-xs text-zinc-400">{squad.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-16 rounded-full bg-white/5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: squad.color }}
                          animate={{ width: isRunning ? `${60 + Math.random() * 40}%` : "0%" }}
                          transition={{ duration: 2, repeat: isRunning ? Infinity : 0, repeatType: "reverse" }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-600 w-6 text-right">{squad.capacity}pt</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
