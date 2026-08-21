"use client";

import { useWallet } from "@/lib/use-wallet";

export function WalletConnect() {
  const { address, isConnected, connect, disconnect, error } = useWallet();

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-ink/60">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          type="button"
          onClick={disconnect}
          className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium transition-transform hover:-translate-y-[1px] active:translate-y-0"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={connect}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-[1px] active:translate-y-0"
      >
        Connect wallet
      </button>
      {error && <span className="text-xs text-tampered">{error}</span>}
    </div>
  );
}
