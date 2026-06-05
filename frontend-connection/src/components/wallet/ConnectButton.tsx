"use client";

import { ConnectButton as RainbowConnect } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Wallet } from "@phosphor-icons/react";

export function ConnectButton() {
  const { isConnected } = useAccount();

  return <RainbowConnect />;
}