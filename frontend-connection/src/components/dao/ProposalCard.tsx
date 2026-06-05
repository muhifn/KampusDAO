"use client";

import Link from "next/link";
import { Clock, CheckCircle, XCircle, CircleNotch } from "@phosphor-icons/react";

interface ProposalCardProps {
  id: number;
  title: string;
  description: string;
  status: "pending" | "active" | "succeeded" | "executed" | "defeated";
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  deadline: string;
  proposer: string;
}

const statusStyles = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  succeeded: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  executed: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  defeated: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export function ProposalCard({
  id,
  title,
  description,
  status,
  forVotes,
  againstVotes,
  abstainVotes,
  deadline,
  proposer,
}: ProposalCardProps) {
  const totalVotes = forVotes + againstVotes + abstainVotes;
  const forPercentage = totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0;
  const againstPercentage = totalVotes > 0 ? (againstVotes / totalVotes) * 100 : 0;
  const abstainPercentage = totalVotes > 0 ? (abstainVotes / totalVotes) * 100 : 0;

  return (
    <Link
      href={`/proposals/${id}`}
      className="block rounded-xl bg-stone-900 border border-stone-800 p-6 transition-all hover:border-stone-700"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
              <span className={`h-2 w-2 rounded-full ${statusStyles[status].split(" ")[1]}`} />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span className="text-xs text-stone-500">
              by {proposer}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-stone-100">
            {title}
          </h3>
          <p className="mt-2 text-sm text-stone-400 line-clamp-2">
            {description}
          </p>
        </div>

        {status === "active" && (
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Clock size={16} />
            <span>{deadline}</span>
          </div>
        )}
      </div>

      {/* Vote Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
          <span>
            <CheckCircle size={14} className="inline-block mr-1 text-green-500" />
            For: {forVotes}
          </span>
          <span>
            <XCircle size={14} className="inline-block mr-1 text-red-500" />
            Against: {againstVotes}
          </span>
          <span>
            <CircleNotch size={14} className="inline-block mr-1 text-gray-400" />
            Abstain: {abstainVotes}
          </span>
        </div>
        <div className="flex h-2 gap-1 rounded-full bg-stone-800 overflow-hidden">
          <div className="bg-green-500 h-full" style={{ width: `${forPercentage}%` }} />
          <div className="bg-red-500 h-full" style={{ width: `${againstPercentage}%` }} />
          <div className="bg-gray-400 h-full" style={{ width: `${abstainPercentage}%` }} />
        </div>
      </div>
    </Link>
  );
}

export type { ProposalCardProps };