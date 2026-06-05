"use client";

import { useParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { governorAbi, CONTRACTS } from "@/lib/contracts";
import { Clock, CheckCircle, XCircle, MinusCircle, ArrowLeft, CircleNotch, Warning } from "@phosphor-icons/react";
import { VoteButton } from "@/components/dao/VoteButton";
import Link from "next/link";

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: "Pending", color: "bg-amber-500 text-amber-500 border-amber-500/20" },
  1: { label: "Active", color: "bg-green-500 text-green-500 border-green-500/20" },
  2: { label: "Canceled", color: "bg-gray-500 text-gray-500 border-gray-500/20" },
  3: { label: "Defeated", color: "bg-red-500 text-red-500 border-red-500/20" },
  4: { label: "Succeeded", color: "bg-blue-500 text-blue-500 border-blue-500/20" },
  5: { label: "Queued", color: "bg-purple-500 text-purple-500 border-purple-500/20" },
  6: { label: "Expired", color: "bg-gray-400 text-gray-400 border-gray-400/20" },
  7: { label: "Executed", color: "bg-indigo-500 text-indigo-500 border-indigo-500/20" },
}

export default function ProposalDetailPage() {
  const params = useParams();
  const proposalId = params.id as string;
  const { isConnected } = useAccount();

  const { data: proposalState, isLoading: isLoadingState } = useReadContract({
    address: CONTRACTS.CampusGovernor,
    abi: governorAbi,
    functionName: "state",
    args: [BigInt(proposalId)],
  });

  const { data: votes, isLoading: isLoadingVotes } = useReadContract({
    address: CONTRACTS.CampusGovernor,
    abi: governorAbi,
    functionName: "proposalVotes",
    args: [BigInt(proposalId)],
  });

  const { data: proposalDeadline, isLoading: isLoadingDeadline } = useReadContract({
    address: CONTRACTS.CampusGovernor,
    abi: governorAbi,
    functionName: "proposalDeadline",
    args: [BigInt(proposalId)],
  });

  if (isLoadingState || isLoadingVotes || isLoadingDeadline) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12 md:py-24">
        <div className="flex-1 flex items-center justify-center">
          <CircleNotch className="animate-spin text-stone-500" size={48} />
        </div>
      </main>
    )
  }

  const stateIdx = Number(proposalState ?? 0);
  const stateData = statusMap[stateIdx] || statusMap[0];

  const forVotes = Number(votes?.[0] ?? 0);
  const againstVotes = Number(votes?.[1] ?? 0);
  const abstainVotes = Number(votes?.[2] ?? 0);
  const totalVotes = forVotes + againstVotes + abstainVotes;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/proposals"
        className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-200 mb-8"
      >
        <ArrowLeft size={16} />
        Back to Proposals
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border ${stateData.color}`}>
            <span className={`h-2 w-2 rounded-full ${stateData.color.split(' ')[0]}`} />
            {stateData.label}
          </span>
          <span className="text-xs text-stone-500">
            ID: {proposalId}
          </span>
        </div>

        <h1 className="text-3xl font-bold text-stone-100">
          Proposal #{proposalId.slice(0, 8)}
        </h1>
      </div>

      {/* Description Section (Check Description from proposal creation, fallback to placeholder) */}
      {/* 
         NOTE: In OpenZeppelin Governor, `description` is part of proposal creation arguments but cannot be read by just `proposalId` without a backend.
         Ideally we put description on-chain or subgraph. 
         Here we'll show a placeholder or ask user to check Etherscan for description until we implement event fetching per single ID.
         Alternatively we could add description to useReadContract if we had a mapping array of IDs to descriptions! 
      */}

      <div className="rounded-xl bg-stone-900 border border-stone-800 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Voting Details</h2>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-stone-300">Proposal Deadline</span>
          <span className="font-mono text-sm text-stone-100">Block {proposalDeadline?.toString()}</span>
        </div>
      </div>

      {/* Voting Section */}
      <section id="voting" className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Voting Progress</h2>
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <div className="mb-6 p-4 bg-stone-800 rounded-lg">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-green-400 flex items-center gap-2">
                <CheckCircle size={16} /> For
              </span>
              <span className="font-semibold text-stone-100">{forVotes} votes</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="mb-6 p-4 bg-stone-800 rounded-lg">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-red-400 flex items-center gap-2">
                <XCircle size={16} /> Against
              </span>
              <span className="font-semibold text-stone-100">{againstVotes} votes</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${totalVotes > 0 ? (againstVotes / totalVotes) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="mb-6 p-4 bg-stone-800 rounded-lg">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400 flex items-center gap-2">
                <MinusCircle size={16} /> Abstain
              </span>
              <span className="font-semibold text-stone-100">{abstainVotes} votes</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-400 transition-all duration-500"
                style={{ width: `${totalVotes > 0 ? (abstainVotes / totalVotes) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Cast Vote Section */}
      <section id="cast-vote">
        <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          {isConnected ? (
            <div className="flex gap-4">
              <VoteButton proposalId={proposalId} support={1} />
              <VoteButton proposalId={proposalId} support={0} />
              <VoteButton proposalId={proposalId} support={2} />
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <Warning size={32} className="text-stone-400 mb-2" />
              <p className="text-stone-400">Connect your wallet to vote.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
