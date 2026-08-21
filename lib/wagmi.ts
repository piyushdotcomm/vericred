import { http, createConfig } from "wagmi";
import { hardhat, polygonAmoy } from "wagmi/chains";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ??
  "0000000000000000000000000000000000000000000000000000000000000000";

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

// Use Polygon Amoy when a hosted RPC is configured; otherwise fall back to
// the local Hardhat chain for offline/demo runs.
const chain =
  process.env.NEXT_PUBLIC_CHAIN_ID === "80002" ||
  process.env.NEXT_PUBLIC_RPC_URL?.includes("amoy") ||
  process.env.NEXT_PUBLIC_RPC_URL?.includes("polygon")
    ? polygonAmoy
    : hardhat;

const chains = [chain] as const;

export const wagmiConfig = createConfig({
  chains,
  transports: {
    [hardhat.id]: http(rpcUrl),
    [polygonAmoy.id]: http(rpcUrl),
  },
  ssr: true,
});

export const walletConnectProjectId = projectId;
