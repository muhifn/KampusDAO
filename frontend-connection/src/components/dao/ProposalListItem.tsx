"use client";

import { useReadContract } from "wagmi";
import { governorAbi, CONTRACTS } from "@/lib/contracts";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, MinusCircle } from "@phosphor-icons/react";
import { Proposal } from "@/hooks/useProposals";

interface ProposalListItemProps {
  proposal: Proposal;
}

const statusMap: Record<number, { label: string; color: string }> = {
  0: { label: "Pending", "color": "bg-amber-500 text-amber-500 border-amber-500/20" },
  1: { label: "Active", color: "bg-green-500 text-green-500 border-green-500/20" },
  2: { label: "Canceled", color: "bg-gray-500 text-gray-500 border-gray-500/20" },
  3: { label: "Defeated", color: "bg-red-500 text-red-500 border-red-500/20" },
  4: { label: "Succeeded", color: "bg-blue-500 text-blue-500 border-blue-500/20" },
  5: { label: "Queued", color: "bg-purple-500 text-purple-500 border-purple-500/20" },
  6: { label: "Expired", color: "bg-gray-400 text-gray-400 border-gray-400/20" },
  7: { label: "Executed", color: "bg-indigo-500 text-indigo-500 border-indigo-500/20" },
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

  const forVotes = Number(votes?.[0] ?? 0);
  const againstVotes = Number(votes?.[1] ?? 0);
  const abstainVotes = Number(votes?.[2] ?? 0);
  const totalVotes = forVotes + againstVotes + abstainVotes;

  return (
    <div className="rounded-xl bg-stone-900 border border-stone-800 p-6 hover:border-stone-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border ${stateData.color}`}>
          <span className={`h-2 w-2 rounded-full ${stateData.color.split(' ')[0]}`} />
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
