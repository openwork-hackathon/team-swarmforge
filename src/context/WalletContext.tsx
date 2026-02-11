"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { CONTRACTS, ERC20_ABI, RPC_URL, CHAIN_ID } from "@/lib/contracts";

// Minimal ethers imports via dynamic import to avoid SSR issues
let ethersModule: typeof import("ethers") | null = null;

interface WalletState {
  address: string | null;
  chainId: number | null;
  openworkBalance: string;
  swarmBalance: string;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  formatBalance: (bal: string) => string;
}

const WalletContext = createContext<WalletState>({
  address: null,
  chainId: null,
  openworkBalance: "0",
  swarmBalance: "0",
  isConnecting: false,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  formatBalance: () => "0",
});

export function useWallet() {
  return useContext(WalletContext);
}

async function getEthers() {
  if (!ethersModule) {
    ethersModule = await import("ethers");
  }
  return ethersModule;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [openworkBalance, setOpenworkBalance] = useState("0");
  const [swarmBalance, setSwarmBalance] = useState("0");
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchBalances = useCallback(async (addr: string) => {
    try {
      const { ethers } = await getEthers();
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const owContract = new ethers.Contract(CONTRACTS.OPENWORK, ERC20_ABI, provider);
      const swContract = new ethers.Contract(CONTRACTS.SWARM, ERC20_ABI, provider);

      const [owBal, swBal] = await Promise.all([
        owContract.balanceOf(addr),
        swContract.balanceOf(addr).catch(() => BigInt(0)),
      ]);

      setOpenworkBalance(ethers.formatEther(owBal));
      setSwarmBalance(ethers.formatEther(swBal));
    } catch (e) {
      console.error("Failed to fetch balances:", e);
    }
  }, []);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const { ethers } = await getEthers();
      const provider = new ethers.BrowserProvider((window as any).ethereum);

      // Request accounts
      const accounts = await provider.send("eth_requestAccounts", []);
      const addr = accounts[0];
      setAddress(addr);

      // Check chain
      const network = await provider.getNetwork();
      const currentChainId = Number(network.chainId);
      setChainId(currentChainId);

      // Switch to Base if needed
      if (currentChainId !== CHAIN_ID) {
        try {
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x" + CHAIN_ID.toString(16) }],
          });
          setChainId(CHAIN_ID);
        } catch (switchError: any) {
          // Chain not added, add it
          if (switchError.code === 4902) {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x" + CHAIN_ID.toString(16),
                chainName: "Base",
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                rpcUrls: [RPC_URL],
                blockExplorerUrls: ["https://basescan.org"],
              }],
            });
          }
        }
      }

      await fetchBalances(addr);
    } catch (e) {
      console.error("Connect failed:", e);
    } finally {
      setIsConnecting(false);
    }
  }, [fetchBalances]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setOpenworkBalance("0");
    setSwarmBalance("0");
  }, []);

  const formatBalance = useCallback((bal: string) => {
    const num = parseFloat(bal);
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
    if (num >= 1) return num.toFixed(0);
    return num.toFixed(2);
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        fetchBalances(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      setChainId(parseInt(chainIdHex, 16));
    };

    (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
    (window as any).ethereum.on("chainChanged", handleChainChanged);

    return () => {
      (window as any).ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      (window as any).ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect, fetchBalances]);

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        openworkBalance,
        swarmBalance,
        isConnecting,
        isConnected: !!address,
        connect,
        disconnect,
        formatBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
