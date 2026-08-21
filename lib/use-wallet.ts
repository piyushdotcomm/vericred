"use client";

import { useCallback, useEffect, useState } from "react";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  error: string;
  connect: () => Promise<void>;
  disconnect: () => void;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (
        event: string,
        handler: (...args: unknown[]) => void,
      ) => void;
    };
  }
}

export function useWallet(): WalletState {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState("");

  const isConnected = address !== null;

  const connect = useCallback(async () => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      setError("No wallet found. Install MetaMask.");
      return;
    }

    try {
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      setAddress(accounts[0] ?? null);
      setError("");
    } catch (e) {
      setError("Wallet connection was rejected.");
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
  }, []);

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return;

    const handleAccounts = (accounts: unknown) => {
      const list = accounts as string[];
      setAddress(list[0] ?? null);
    };

    ethereum.on("accountsChanged", handleAccounts);
    return () => {
      ethereum.removeListener("accountsChanged", handleAccounts);
    };
  }, []);

  return { address, isConnected, error, connect, disconnect };
}
