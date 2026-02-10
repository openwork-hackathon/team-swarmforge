// Council Agent Registry — 441 agents, 5 tiers
export interface Agent {
  code: string;
  name: string;
  tier: number;
  role: string;
  squad?: string;
  specialties: string[];
  reputation: number;
  wins: number;
  losses: number;
  tasksCompleted: number;
  status: "idle" | "working" | "competing";
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "build" | "battle" | "speedrun";
  status: "pending" | "active" | "completed";
  submittedBy: string;
  assignedAgents: string[];
  startedAt?: number;
  completedAt?: number;
  output?: string;
  score?: number;
  stakedAmount: number;
}

export interface SwarmEvent {
  id: string;
  timestamp: number;
  agentCode: string;
  agentTier: number;
  action: string;
  detail: string;
  challengeId: string;
}

// Tier structure from The Council
const TIERS = [
  { tier: 0, label: "L5-BLACK", color: "#FFD700", title: "Divine Orchestrator" },
  { tier: 1, label: "L4-RESTRICTED", color: "#1E40AF", title: "Strategic Command" },
  { tier: 2, label: "L3-CONFIDENTIAL", color: "#7C3AED", title: "Division Leaders" },
  { tier: 3, label: "L2-INTERNAL", color: "#059669", title: "Specialists" },
  { tier: 4, label: "L1-PUBLIC", color: "#94A3B8", title: "Operatives" },
];

export function getTierInfo(tier: number) {
  return TIERS[tier] || TIERS[4];
}

// Real Council agents (subset for display)
const COUNCIL_AGENTS: Agent[] = [
  // Tier 0
  { code: "GENESIS", name: "Genesis", tier: 0, role: "Divine Orchestrator", specialties: ["orchestration", "strategy", "all-domains"], reputation: 100, wins: 847, losses: 3, tasksCompleted: 12453, status: "idle" },
  // Tier 1
  { code: "SOVEREIGN", name: "Sovereign", tier: 1, role: "Strategic Advisor", specialties: ["strategy", "synthesis", "decisions"], reputation: 98, wins: 612, losses: 8, tasksCompleted: 8921, status: "idle" },
  { code: "MNEMOS", name: "Mnemos", tier: 1, role: "Memory Architect", specialties: ["memory", "context", "knowledge"], reputation: 97, wins: 589, losses: 11, tasksCompleted: 7834, status: "idle" },
  { code: "AEGIS", name: "Aegis", tier: 1, role: "Security Director", specialties: ["security", "compliance", "auditing"], reputation: 99, wins: 701, losses: 2, tasksCompleted: 9102, status: "idle" },
  { code: "PRAXIS", name: "Praxis", tier: 1, role: "Operations Director", specialties: ["operations", "automation", "efficiency"], reputation: 96, wins: 534, losses: 15, tasksCompleted: 7456, status: "idle" },
  { code: "TRUST_DIRECTOR", name: "Trust Director", tier: 1, role: "Trust Law Lead", specialties: ["trust-law", "asset-protection", "compliance"], reputation: 95, wins: 488, losses: 12, tasksCompleted: 6234, status: "idle" },
  // Tier 2 — Division Leaders
  { code: "TECHNE", name: "Techne", tier: 2, role: "Technology Lead", squad: "ALPHA", specialties: ["frontend", "react", "nextjs", "typescript"], reputation: 94, wins: 423, losses: 17, tasksCompleted: 5678, status: "idle" },
  { code: "BASTION", name: "Bastion", tier: 2, role: "Infrastructure Lead", squad: "BETA", specialties: ["backend", "databases", "devops"], reputation: 93, wins: 401, losses: 19, tasksCompleted: 5432, status: "idle" },
  { code: "SOPHIA", name: "Sophia", tier: 2, role: "AI/ML Lead", squad: "GAMMA", specialties: ["ai", "ml", "research", "analysis"], reputation: 95, wins: 445, losses: 10, tasksCompleted: 5890, status: "idle" },
  { code: "LEXIS", name: "Lexis", tier: 2, role: "Legal Counsel", specialties: ["legal", "contracts", "compliance"], reputation: 92, wins: 378, losses: 22, tasksCompleted: 4567, status: "idle" },
  { code: "AURUM", name: "Aurum", tier: 2, role: "Finance Director", specialties: ["finance", "investment", "valuation"], reputation: 91, wins: 356, losses: 24, tasksCompleted: 4321, status: "idle" },
  { code: "MELODIA", name: "Melodia", tier: 2, role: "Creative Director", specialties: ["music", "audio", "creative"], reputation: 90, wins: 334, losses: 26, tasksCompleted: 4012, status: "idle" },
  { code: "APP_ALCHEMIST", name: "App Alchemist", tier: 2, role: "Mobile Lead", squad: "EPSILON", specialties: ["mobile", "react-native", "expo"], reputation: 89, wins: 312, losses: 28, tasksCompleted: 3890, status: "idle" },
  { code: "FORTUNA", name: "Fortuna", tier: 2, role: "Trading Strategist", specialties: ["trading", "crypto", "defi"], reputation: 88, wins: 298, losses: 32, tasksCompleted: 3654, status: "idle" },
  { code: "RUST_FORGE", name: "Rust Forge", tier: 2, role: "Rust Transmuter", specialties: ["rust", "tauri", "systems"], reputation: 87, wins: 267, losses: 13, tasksCompleted: 2890, status: "idle" },
  { code: "VIDEO_FORGE", name: "Video Forge", tier: 2, role: "Video Production", specialties: ["video", "ai-gen", "animation"], reputation: 86, wins: 245, losses: 15, tasksCompleted: 2567, status: "idle" },
  { code: "KIRO_MASTER", name: "Kiro Master", tier: 2, role: "Spec-Driven Dev", specialties: ["specs", "steering", "checkpoints"], reputation: 85, wins: 234, losses: 16, tasksCompleted: 2345, status: "idle" },
  // Tier 3 — Specialists
  { code: "CALAMUS", name: "Calamus", tier: 3, role: "Documentation", specialties: ["docs", "writing", "reports"], reputation: 82, wins: 189, losses: 31, tasksCompleted: 1987, status: "idle" },
  { code: "CHRONOS", name: "Chronos", tier: 3, role: "Scheduling", specialties: ["scheduling", "planning", "timelines"], reputation: 81, wins: 178, losses: 32, tasksCompleted: 1876, status: "idle" },
  { code: "HERMES", name: "Hermes", tier: 3, role: "Communications", specialties: ["messaging", "notifications", "delivery"], reputation: 80, wins: 167, losses: 33, tasksCompleted: 1765, status: "idle" },
  { code: "LOGOS", name: "Logos", tier: 3, role: "Logic Engine", specialties: ["logic", "reasoning", "validation"], reputation: 83, wins: 201, losses: 19, tasksCompleted: 2123, status: "idle" },
  // Tier 4 — Operatives
  { code: "SCOUT", name: "Scout", tier: 4, role: "Reconnaissance", specialties: ["search", "discovery", "recon"], reputation: 75, wins: 134, losses: 46, tasksCompleted: 1456, status: "idle" },
  { code: "FORMA", name: "Forma", tier: 4, role: "Formatting", specialties: ["formatting", "templates", "output"], reputation: 74, wins: 123, losses: 47, tasksCompleted: 1345, status: "idle" },
];

// Generate additional agents to fill 441 total
function generateAgents(): Agent[] {
  const all = [...COUNCIL_AGENTS];
  const subRoles = [
    "Analyst", "Engineer", "Auditor", "Researcher", "Builder",
    "Optimizer", "Validator", "Monitor", "Executor", "Planner",
  ];
  const prefixes = [
    "NEXUS", "AXIOM", "VERDICT", "SYNTHESIS", "ARCHIVE", "CONTEXT",
    "FORTRESS", "PHANTOM", "VELOCITY", "ZERO", "CIPHER", "VECTOR",
    "HELIX", "PRISM", "FLUX", "NOVA", "APEX", "CORE", "ECHO", "VORTEX",
  ];

  let id = all.length;
  while (all.length < 441) {
    const tier = id < 40 ? 2 : id < 160 ? 3 : 4;
    const prefix = prefixes[id % prefixes.length];
    const suffix = Math.floor(id / prefixes.length);
    all.push({
      code: `${prefix}_${suffix}`,
      name: `${prefix[0]}${prefix.slice(1).toLowerCase()}-${suffix}`,
      tier,
      role: subRoles[id % subRoles.length],
      specialties: [subRoles[id % subRoles.length].toLowerCase()],
      reputation: Math.max(50, 95 - tier * 10 - Math.floor(Math.random() * 15)),
      wins: Math.floor(Math.random() * 200),
      losses: Math.floor(Math.random() * 50),
      tasksCompleted: Math.floor(Math.random() * 2000),
      status: "idle",
    });
    id++;
  }
  return all;
}

export const ALL_AGENTS = generateAgents();

export function getAgentsByTier(tier: number): Agent[] {
  return ALL_AGENTS.filter((a) => a.tier === tier);
}

export function getTopAgents(limit = 10): Agent[] {
  return [...ALL_AGENTS].sort((a, b) => b.reputation - a.reputation).slice(0, limit);
}

// Scrum squads
export const SQUADS = [
  { name: "ALPHA", lead: "TECHNE", focus: "Frontend/UI", capacity: 34, color: "#FFD700" },
  { name: "BETA", lead: "BASTION", focus: "Backend/API", capacity: 30, color: "#1E40AF" },
  { name: "GAMMA", lead: "SOPHIA", focus: "AI/ML", capacity: 26, color: "#7C3AED" },
  { name: "DELTA", lead: "BASTION", focus: "Data/Infra", capacity: 24, color: "#059669" },
  { name: "EPSILON", lead: "APP_ALCHEMIST", focus: "Mobile", capacity: 26, color: "#F59E0B" },
  { name: "ZETA", lead: "AEGIS", focus: "Security", capacity: 20, color: "#DC2626" },
  { name: "ETA", lead: "PRAXIS", focus: "QA/DevOps", capacity: 22, color: "#06B6D4" },
];
