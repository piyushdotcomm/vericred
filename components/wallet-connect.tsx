"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnect() {
  return (
    <div className="[&_button]:!font-mono [&_button]:!text-xs [&_button]:!uppercase [&_button]:!tracking-widest">
      <ConnectButton
        accountStatus="address"
        chainStatus="icon"
        showBalance={false}
      />
    </div>
  );
}
