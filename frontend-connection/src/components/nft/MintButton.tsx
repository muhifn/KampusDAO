"use client";

import { useReadContract, useWriteContract } from "wagmi";
import { CONTRACTS, sbtAbi } from "@/lib/contracts";
import { useState } from "react";
import { CircleNotch, SealCheck, Warning, CheckCircle } from "@phosphor-icons/react";

interface MintButtonProps {
  address: `0x${string}`;
}

export function MintButton({ address }: MintButtonProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: hasPass, isLoading: isCheckingPass, error: checkPassError } = useReadContract({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    functionName: "hasPass",
    args: address ? [address] : undefined,
  });

  const { data: isWhitelisted, isLoading: isCheckingWhitelist } = useReadContract({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    functionName: "isWhitelisted",
    args: address ? [address] : undefined,
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const handleClaim = async () => {
    try {
      setError(null);
      setIsSuccess(false);
      setTxHash(null);
      
      const hash = await writeContractAsync({
        address: CONTRACTS.CampusSoulboundNFT,
        abi: sbtAbi,
        functionName: "claimPass",
        gas: BigInt(400_000),
      });
      
      setTxHash(hash);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    }
  };

  if (isCheckingPass || isCheckingWhitelist) {
    return (
      <button
        className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"
        disabled
      >
        <CircleNotch className="animate-spin" size={20} />
        Checking eligibility...
      </button>
    );
  }

  if (hasPass) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground">
        <CheckCircle size={20} className="text-success" />
        Pass already claimed
      </div>
    );
  }

  if (!isWhitelisted) {
    return (
      <button
        className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium text-muted-foreground"
        disabled
      >
        <Warning size={20} />
        Not whitelisted
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-accent/90 disabled:opacity-50"
        disabled={isPending}
        onClick={handleClaim}
      >
        {isPending ? (
          <>
            <CircleNotch className="animate-spin" size={20} />
            Claiming...
          </>
        ) : (
          <>
            <SealCheck size={20} />
            Claim Campus Pass
          </>
        )}
      </button>
      
      {isSuccess && (
        <div className="flex items-center gap-2 text-xs text-success">
          <CheckCircle size={16} />
          <a
            href={`https://sepolia.etherscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View transaction
          </a>
        </div>
      )}
      
      {error && (
        <p className="text-xs text-error">Error: {error}</p>
      )}
    </div>
  );
}