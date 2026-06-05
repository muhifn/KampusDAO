"use client";

import { useState } from "react";
import { useWriteContract, useAccount, useReadContract } from "wagmi";
import { CONTRACTS, governorAbi, sbtAbi } from "@/lib/contracts";
import { CircleNotch, CheckCircle, XCircle, Divide } from "@phosphor-icons/react";

interface VoteButtonProps {
  proposalId: string;
  support: number; // 0=Against, 1=For, 2=Abstain
}

export function VoteButton({ proposalId, support }: VoteButtonProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();

  const { data: hasPass, isLoading: isCheckingPass } = useReadContract({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    functionName: "hasPass",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: alreadyVoted, isLoading: isCheckingVoted } = useReadContract({
    address: CONTRACTS.CampusGovernor,
    abi: governorAbi,
    functionName: "hasVoted",
    args: address ? [BigInt(proposalId), address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const handleVote = async () => {
    try {
      setError(null);
      setIsSuccess(false);
      setTransactionHash(null);
      
      const hash = await writeContractAsync({
        address: CONTRACTS.CampusGovernor,
        abi: governorAbi,
        functionName: "castVote",
        args: [BigInt(proposalId), support],
        gas: BigInt(300_000),
      });

      setTransactionHash(hash);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to vote");
    }
  };

  const buttonStyles = {
    1: "bg-green-600 hover:bg-green-700",
    0: "bg-red-600 hover:bg-red-700", 
    2: "bg-gray-600 hover:bg-gray-700",
  };

  const buttonLabels = {
    1: "Yes",
    0: "No",
    2: "Abstain",
  };

  return (
    <div className="space-y-2">
      <button
        className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors disabled:opacity-50 ${buttonStyles[support as keyof typeof buttonStyles]}`}
        disabled={isPending || isCheckingPass || !hasPass || isCheckingVoted || alreadyVoted}
        onClick={handleVote}
      >
        {isPending ? (
          <CircleNotch className="animate-spin" size={18} />
        ) : support === 1 ? (
          <CheckCircle size={18} />
        ) : support === 0 ? (
          <XCircle size={18} />
        ) : (
          <Divide size={18} />
        )}
        {isCheckingPass ? "Checking..." : isPending ? "Voting..." : !hasPass ? "No Pass" : alreadyVoted ? "Voted" : `Vote ${buttonLabels[support as keyof typeof buttonLabels]}`}
      </button>

      {!hasPass && !isCheckingPass && (
        <p className="text-xs text-yellow-500">
          You need a Campus Pass to vote.
        </p>
      )}

      {isSuccess && (
        <p className="text-xs text-green-500 flex items-center gap-2">
          <CheckCircle size={14} />
          Vote submitted!
          <a
            href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View transaction
          </a>
        </p>
      )}

      {error && (
        <p className="text-xs text-red-500">
          Error: {error}
        </p>
      )}
    </div>
  );
}