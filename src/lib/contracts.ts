// On-chain contract addresses and ABIs (Base L2)
export const CHAIN_ID = 8453;
export const RPC_URL = "https://mainnet.base.org";

export const CONTRACTS = {
  OPENWORK: "0x299c30DD5974BF4D5bFE42C340CA40462816AB07",
  SWARM: "0xb046fce565ad6bc12645fd2d6518e949534d6036",
  MINT_CLUB_BOND: "0xc5a076cad94176c2996B32d8466Be1cE757FAa27",
} as const;

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
] as const;

export const BOND_ABI = [
  "function mint(address token, uint256 tokensToMint, uint256 maxReserveAmount, address receiver) external",
  "function burn(address token, uint256 tokensToBurn, uint256 minRefund, address receiver) external",
  "function currentPrice(address token) view returns (uint256)",
] as const;

// Platform fee structure
export const PLATFORM = {
  ARENA_FEE_BPS: 200, // 2% platform cut on arena pools
  MIN_STAKE: 100, // minimum 100 $OPENWORK to stake
  MIN_JOB_PAYMENT: 500, // minimum 500 $OPENWORK for marketplace jobs
  SWARM_THRESHOLD: 1000, // hold 1000 $SWARM for premium features
} as const;
