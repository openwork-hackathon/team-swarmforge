// Swarm simulation engine — generates realistic agent activity
import { ALL_AGENTS, type SwarmEvent, type Challenge, SQUADS } from "./agents";

const BUILD_ACTIONS = [
  "Decomposing task into subtasks",
  "Analyzing requirements",
  "Designing component architecture",
  "Setting up project scaffolding",
  "Implementing data models",
  "Building API endpoints",
  "Creating UI components",
  "Writing unit tests",
  "Optimizing performance",
  "Running security audit",
  "Deploying to staging",
  "Code review in progress",
  "Integrating subsystems",
  "Writing documentation",
  "Final QA validation",
  "Deploying to production",
];

const BUILD_DETAILS: Record<string, string[]> = {
  "GENESIS": [
    "Orchestrating full swarm — 7 squads activated",
    "Assigning sprint backlog to squads",
    "Running autonomous coordination protocol",
    "Geometric manifold routing engaged",
    "Task decomposition: 1 epic → 12 stories → 47 tasks",
  ],
  "TECHNE": [
    "Scaffolding Next.js 16 + Tailwind 4 + Framer Motion",
    "Building responsive dashboard layout",
    "Implementing real-time WebSocket visualization",
    "Creating interactive agent network graph",
    "Optimizing Lighthouse score to 98",
  ],
  "BASTION": [
    "Setting up FastAPI with WebSocket support",
    "Designing PostgreSQL schema for agent state",
    "Implementing Redis pub/sub for real-time events",
    "Building REST API with rate limiting",
    "Configuring serverless deployment",
  ],
  "SOPHIA": [
    "Training reward predictor on task outcomes",
    "Hyperbolic embedding search for optimal agent assignment",
    "Running Pareto optimization on resource allocation",
    "Semantic similarity matching for task routing",
    "Evaluating model confidence scores",
  ],
  "AEGIS": [
    "Scanning dependencies for vulnerabilities",
    "Auditing smart contract for reentrancy",
    "Implementing rate limiting and DDoS protection",
    "Validating input sanitization across all endpoints",
    "Running OWASP Top 10 compliance check",
  ],
};

const BATTLE_ACTIONS = [
  "Analyzing opponent strategy",
  "Optimizing solution approach",
  "Executing algorithm implementation",
  "Running benchmark tests",
  "Submitting solution",
  "Reviewing opponent submission",
  "Calculating final scores",
];

let eventCounter = 0;

export function generateSwarmEvents(
  challengeId: string,
  type: "build" | "battle" | "speedrun",
  count: number = 5
): SwarmEvent[] {
  const events: SwarmEvent[] = [];
  const now = Date.now();

  const actions = type === "battle" ? BATTLE_ACTIONS : BUILD_ACTIONS;
  const activeAgents = type === "battle"
    ? ALL_AGENTS.filter((a) => a.tier <= 2).slice(0, 8)
    : ALL_AGENTS.filter((a) => a.tier <= 3).slice(0, 20);

  for (let i = 0; i < count; i++) {
    const agent = activeAgents[Math.floor(Math.random() * activeAgents.length)];
    const agentDetails = BUILD_DETAILS[agent.code];
    const detail = agentDetails
      ? agentDetails[Math.floor(Math.random() * agentDetails.length)]
      : actions[Math.floor(Math.random() * actions.length)];

    events.push({
      id: `evt_${++eventCounter}`,
      timestamp: now - (count - i) * 2000 + Math.random() * 1000,
      agentCode: agent.code,
      agentTier: agent.tier,
      action: actions[Math.floor(Math.random() * actions.length)],
      detail,
      challengeId,
    });
  }

  return events.sort((a, b) => a.timestamp - b.timestamp);
}

// Simulate a product build
export function simulateProductBuild(description: string): {
  phases: { name: string; squad: string; tasks: string[]; duration: string }[];
  totalAgents: number;
  estimatedTime: string;
} {
  const phases = [
    {
      name: "Sprint Planning",
      squad: "GENESIS + All Leads",
      tasks: [
        `Decompose "${description.slice(0, 50)}..." into epics`,
        "Break epics into user stories",
        "Estimate story points per squad",
        "Assign sprint backlog",
      ],
      duration: "~8s",
    },
    {
      name: "Architecture & Design",
      squad: SQUADS[0].name,
      tasks: [
        "Design system architecture",
        "Define API contracts",
        "Create component hierarchy",
        "Plan data models",
      ],
      duration: "~15s",
    },
    {
      name: "Backend Development",
      squad: SQUADS[1].name,
      tasks: [
        "Implement API routes",
        "Set up database schema",
        "Build authentication",
        "Create WebSocket handlers",
      ],
      duration: "~20s",
    },
    {
      name: "Frontend Development",
      squad: SQUADS[0].name,
      tasks: [
        "Build page layouts",
        "Implement interactive components",
        "Add animations and polish",
        "Responsive design pass",
      ],
      duration: "~20s",
    },
    {
      name: "AI/ML Integration",
      squad: SQUADS[2].name,
      tasks: [
        "Integrate ML models",
        "Optimize inference pipeline",
        "Add intelligent features",
      ],
      duration: "~12s",
    },
    {
      name: "Security Audit",
      squad: SQUADS[5].name,
      tasks: [
        "Run vulnerability scan",
        "Audit authentication flow",
        "Validate input sanitization",
      ],
      duration: "~8s",
    },
    {
      name: "QA & Deploy",
      squad: SQUADS[6].name,
      tasks: [
        "Run full test suite",
        "Performance benchmarks",
        "Deploy to production",
        "Post-deploy verification",
      ],
      duration: "~10s",
    },
  ];

  return {
    phases,
    totalAgents: 182,
    estimatedTime: "~93s",
  };
}

// Challenge templates
export const CHALLENGE_TEMPLATES: Omit<Challenge, "id" | "submittedBy" | "assignedAgents" | "status">[] = [
  {
    title: "Build a Real-Time Chat App",
    description: "Create a full-stack real-time chat application with rooms, direct messages, typing indicators, and file sharing. Include authentication and message history.",
    type: "build",
    stakedAmount: 1000,
  },
  {
    title: "Agent vs Agent: Algorithm Challenge",
    description: "Two agents compete to solve a complex optimization problem. Best solution in 60 seconds wins.",
    type: "battle",
    stakedAmount: 5000,
  },
  {
    title: "Speedrun: Landing Page",
    description: "Build a production-ready landing page with hero, features, pricing, and contact form in under 30 seconds.",
    type: "speedrun",
    stakedAmount: 2000,
  },
  {
    title: "Build a DeFi Dashboard",
    description: "Create a DeFi portfolio tracker with wallet connection, token balances, price charts, and swap integration on Base.",
    type: "build",
    stakedAmount: 3000,
  },
  {
    title: "Agent Battle Royale",
    description: "8 agents compete in a multi-round coding tournament. Each round eliminates the weakest. Last agent standing wins.",
    type: "battle",
    stakedAmount: 10000,
  },
];
