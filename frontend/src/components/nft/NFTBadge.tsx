"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS, sbtAbi } from "@/lib/contracts";
import { Lock, CheckCircle, XCircle } from "@phosphor-icons/react";

export function NFTBadge({ address }: { address: `0x${string}` }) {
  const { data: hasPass, isLoading } = useReadContract({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    functionName: "hasPass",
    args: [address],
  });

  const { data: tokenId } = useReadContract({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    functionName: "getPassTokenId",
    args: [address],
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        <span className="h-4 w-4 animate-pulse rounded-full bg-muted-foreground/50" />
        Loading pass status...
      </div>
    );
  }

  if (!hasPass) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
        <XCircle className="text-error" size={24} />
        <div>
          <p className="text-sm font-medium text-foreground">No Campus Pass</p>
          <p className="text-xs text-muted-foreground">
            You need to be whitelisted to claim your pass.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Lock size={24} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">KampusDAO Pass</p>
          <CheckCircle className="text-success" size={16} />
        </div>
        <p className="text-xs text-muted-foreground">Token ID: {tokenId?.toString() ?? "Unknown"}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Lock size={14} /> Soulbound (Non-transferable)
        </p>
      </div>
    </div>
  );
}