"use client";

import { useReadContract } from "wagmi";
import { governorAbi, CONTRACTS } from "@/lib/contracts";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, MinusCircle } from "@phosphor-icons/react";
import { Proposal } from "@/hooks/useProposals";

interface ProposalListItemProps {
  proposal: Proposal;
}

const statusMap: Record<number, { label: string; color: string; dot: string }> = {
  0: { label: "Pending", color: "bg-amber-500/10 text-amber-400 border-amber-500/20", dot: "bg-amber-500" },
  1: { label: "Active", color: "bg-green-500/10 text-green-400 border-green-500/20", dot: "bg-green-500" },
  2: { label: "Canceled", color: "bg-gray-500/10 text-gray-400 border-gray-500/20", dot: "bg-gray-500" },
  3: { label: "Defeated", color: "bg-red-500/10 text-red-400 border-red-500/20", dot: "bg-red-500" },
  4: { label: "Succeeded", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", dot: "bg-blue-500" },
  5: { label: "Queued", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", dot: "bg-purple-500" },
  6: { label: "Expired", color: "bg-gray-400/10 text-gray-400 border-gray-400/20", dot: "bg-gray-400" },
  7: { label: "Executed", color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", dot: "bg-indigo-500" },
}

export function ProposalListItem({ proposal }: ProposalListItemProps) {
  const { data: proposalState, isLoading: isLoadingState } = useReadContract({
    address: CONTRACTS.CampusGovernor,
    abi: governorAbi,
    functionName: "state",
    args: [BigInt(proposal.proposalId)],
  });

  const { data: votes } = useReadContract({
    address: CONTRACTS.CampusGovernor,
    abi: governorAbi,
    functionName: "proposalVotes",
    args: [BigInt(proposal.proposalId)],
  });

  const stateIdx = Number(proposalState ?? 0);
  const stateData = statusMap[stateIdx] || statusMap[0];

  const titles = proposal.description.split('\n');
  const title = titles[0].replace('# ', '') || "Untitled Proposal";

  const againstVotes = Number(votes?.[0] ?? 0);
  const forVotes = Number(votes?.[1] ?? 0);
  const abstainVotes = Number(votes?.[2] ?? 0);
  const totalVotes = forVotes + againstVotes + abstainVotes;

  return (
    <div className="rounded-xl bg-stone-900 border border-stone-800 p-6 hover:border-stone-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border ${stateData.color}`}>
          <span className={`h-2 w-2 rounded-full ${stateData.dot}`} />
          {isLoadingState ? "Loading..." : stateData.label}
        </span>
        <span className="text-xs text-stone-500">
          ID: ...{proposal.proposalId.slice(-8)}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-stone-100 mb-2 line-clamp-2">
        {title}
      </h3>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-stone-400 mb-1">
          <span>For</span>
          <span>{forVotes} votes</span>
        </div>
        <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500"
            style={{ width: `${totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-stone-500 border-t border-stone-800 pt-4">
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>Ends at block {proposal.voteEnd}</span>
        </div>
        <Link
          href={`/proposals/${proposal.proposalId}`}
          className="text-emerald-400 hover:text-emerald-300 font-medium"
        >
          View & Vote →
        </Link>
      </div>
    </div>
  );
}
