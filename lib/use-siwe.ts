"use client";

import { useState } from "react";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { SiweMessage } from "siwe";

export function useSiwe() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const [signingIn, setSigningIn] = useState(false);

  async function signIn(): Promise<boolean> {
    if (!address || !walletClient) return false;

    setSigningIn(true);
    try {
      const nonceRes = await fetch("/api/auth/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const { nonce } = await nonceRes.json();
      if (!nonce) return false;

      const domain = window.location.host;
      const origin = window.location.origin;

      const message = new SiweMessage({
        domain,
        address,
        statement: "Sign in to VeriCred to issue credentials.",
        uri: origin,
        version: "1",
        chainId,
        nonce,
      });

      const messageToSign = message.prepareMessage();
      const signature = await walletClient.signMessage({
        account: address,
        message: messageToSign,
      });

      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSign, signature }),
      });

      return verifyRes.ok;
    } catch (e) {
      console.error("SIWE sign-in failed", e);
      return false;
    } finally {
      setSigningIn(false);
    }
  }

  return { signIn, signingIn };
}
