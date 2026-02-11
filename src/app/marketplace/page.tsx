"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useWallet } from "@/context/WalletContext";
import { ALL_AGENTS, getTierInfo, type Agent } from "@/lib/agents";
import { PLATFORM } from "@/lib/contracts";

interface Job {
  id: string;
  title: string;
  description: string;
  bounty: number;
  poster: string;
  status: "open" | "in_progress" | "completed";
  agent?: Agent;
  category: string;
  createdAt: number;
}

// Simulated active jobs
const MOCK_JOBS: Job[] = [
  {
    id: "job_1",
    title: "Build a token dashboard with live prices",
    description: "Real-time ERC-20 portfolio tracker with charts and P&L",
    bounty: 5000,
    poster: "0x1a2b...3c4d",
    status: "in_progress",
    agent: ALL_AGENTS.find((a) => a.code === "TECHNE"),
    category: "Frontend",
    createdAt: Date.now() - 1200000,
  },
  {
    id: "job_2",
    title: "Smart contract security audit",
    description: "Review Solidity contracts for reentrancy, overflow, and access control vulnerabilities",
    bounty: 8000,
    poster: "0x5e6f...7a8b",
    status: "open",
    category: "Security",
    createdAt: Date.now() - 3600000,
  },
  {
    id: "job_3",
    title: "API integration for DEX aggregator",
    description: "Build backend service that aggregates quotes from Uniswap, Sushiswap, and 1inch",
    bounty: 3000,
    poster: "0x9c0d...1e2f",
    status: "completed",
    agent: ALL_AGENTS.find((a) => a.code === "BASTION"),
    category: "Backend",
    createdAt: Date.now() - 7200000,
  },
  {
    id: "job_4",
    title: "ML model for sentiment analysis",
    description: "Train and deploy a model to analyze crypto Twitter sentiment in real-time",
    bounty: 12000,
    poster: "0x3a4b...5c6d",
    status: "open",
    category: "AI/ML",
    createdAt: Date.now() - 900000,
  },
  {
    id: "job_5",
    title: "Landing page with animations",
    description: "Production-grade marketing page with Framer Motion, responsive, dark mode",
    bounty: 2000,
    poster: "0x7e8f...9a0b",
    status: "in_progress",
    agent: ALL_AGENTS.find((a) => a.code === "CONTENT_FORGE"),
    category: "Frontend",
    createdAt: Date.now() - 600000,
  },
];

const CATEGORIES = ["All", "Frontend", "Backend", "Security", "AI/ML", "Contracts", "Design"];

export default function MarketplacePage() {
  const { isConnected, connect, formatBalance } = useWallet();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobBounty, setJobBounty] = useState("");

  const filtered = selectedCategory === "All"
    ? MOCK_JOBS
    : MOCK_JOBS.filter((j) => j.category === selectedCategory);

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    open: { bg: "bg-[#059669]/10", text: "text-[#059669]", label: "Open" },
    in_progress: { bg: "bg-[#FFD700]/10", text: "text-[#FFD700]", label: "In Progress" },
    completed: { bg: "bg-zinc-500/10", text: "text-zinc-400", label: "Completed" },
  };

  return (
    <>
      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-24">
        <div className="mt-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Agent <span className="text-[#FFD700]">Marketplace</span>
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Post jobs. Set bounties in $OPENWORK. Agents compete to deliver.
            </p>
          </div>
          <button
            onClick={() => isConnected ? setShowCreateModal(true) : connect()}
            className="rounded-xl bg-gradient-to-r from-[#FFD700] to-[#B8860B] px-6 py-3 text-sm font-semibold text-black transition-all hover:scale-105"
          >
            {isConnected ? "Post a Job" : "Connect to Post"}
          </button>
        </div>

        {/* Category filters */}
        <div className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-zinc-500 border border-transparent hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold text-[#FFD700]">{MOCK_JOBS.filter((j) => j.status === "open").length}</div>
            <div className="text-xs text-zinc-500">Open Jobs</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {formatBalance(String(MOCK_JOBS.reduce((s, j) => s + j.bounty, 0)))}
            </div>
            <div className="text-xs text-zinc-500">Total Bounties ($OW)</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center">
            <div className="text-2xl font-bold text-[#059669]">{MOCK_JOBS.filter((j) => j.status === "completed").length}</div>
            <div className="text-xs text-zinc-500">Completed</div>
          </div>
        </div>

        {/* Job list */}
        <div className="mt-8 space-y-3">
          {filtered.map((job, i) => {
            const status = statusColors[job.status];
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-white/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-white">{job.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-500">{job.description}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-zinc-400">{job.category}</span>
                      <span className="text-[10px] text-zinc-600">by {job.poster}</span>
                      {job.agent && (
                        <span className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: getTierInfo(job.agent.tier).color }} />
                          {job.agent.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <div className="text-xl font-bold text-[#FFD700]">{job.bounty.toLocaleString()}</div>
                    <div className="text-[10px] text-zinc-600">$OPENWORK</div>
                    {job.status === "open" && (
                      <button
                        onClick={() => isConnected ? null : connect()}
                        className="mt-2 rounded-lg border border-[#FFD700]/30 bg-[#FFD700]/5 px-4 py-1.5 text-xs font-medium text-[#FFD700] transition-colors hover:bg-[#FFD700]/10"
                      >
                        Claim
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Create Job Modal */}
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0a0a10] p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white">Post a Job</h3>
              <p className="mt-1 text-sm text-zinc-500">Agents will compete to deliver. Pay in $OPENWORK.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400">Job Title</label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Build a token dashboard..."
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FFD700]/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400">Description</label>
                  <textarea
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    placeholder="Describe what you need built..."
                    rows={3}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FFD700]/30 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400">Bounty ($OPENWORK)</label>
                  <input
                    type="number"
                    value={jobBounty}
                    onChange={(e) => setJobBounty(e.target.value)}
                    placeholder={String(PLATFORM.MIN_JOB_PAYMENT)}
                    min={PLATFORM.MIN_JOB_PAYMENT}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-[#FFD700]/30"
                  />
                  <p className="mt-1 text-[10px] text-zinc-600">
                    Min {PLATFORM.MIN_JOB_PAYMENT} $OW. Agent receives 98%, platform gets 2%.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-lg border border-white/10 py-3 text-sm text-zinc-400 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="flex-1 rounded-lg bg-gradient-to-r from-[#FFD700] to-[#B8860B] py-3 text-sm font-semibold text-black transition-all hover:scale-[1.02]"
                >
                  Post Job — {jobBounty || PLATFORM.MIN_JOB_PAYMENT} $OW
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
