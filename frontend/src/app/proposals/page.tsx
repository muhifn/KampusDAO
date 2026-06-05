"use client";

import { useState } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { Scroll, Plus, CircleNotch } from "@phosphor-icons/react";
import Link from "next/link";
import { useProposals } from "@/hooks/useProposals";
import { ProposalListItem } from "@/components/dao/ProposalListItem";
import { governorAbi, CONTRACTS } from "@/lib/contracts";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "pending", label: "Pending" },
  { key: "succeeded", label: "Succeeded" },
  { key: "executed", label: "Executed" },
  { key: "defeated", label: "Defeated" },
] as const;

const STATE_TO_KEY: Record<number, string> = {
  0: "pending",
  1: "active",
  3: "defeated",
  4: "succeeded",
  7: "executed",
};

export default function ProposalsPage() {
  const { isConnected } = useAccount();
  const { proposals, isLoading, error } = useProposals();
  const [activeFilter, setActiveFilter] = useState("all");

  const { data: states } = useReadContracts({
    contracts: proposals.map((p) => ({
      address: CONTRACTS.CampusGovernor,
      abi: governorAbi,
      functionName: "state",
      args: [BigInt(p.proposalId)],
    })),
  });

  const stateMap: Record<string, number> = {};
  if (states) {
    proposals.forEach((p, i) => {
      const val = states[i]?.result;
      if (val !== undefined) stateMap[p.proposalId] = Number(val);
    });
  }

  const filteredProposals =
    activeFilter === "all"
      ? proposals
      : proposals.filter((p) => {
          const s = stateMap[p.proposalId];
          return s !== undefined && STATE_TO_KEY[s] === activeFilter;
        });

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:py-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-100">
            Proposals
          </h1>
          <p className="mt-2 text-stone-400">
            Browse and vote on active governance proposals
          </p>
        </div>
        {isConnected && (
          <Link
            href="/proposals/create"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-400"
          >
            <Plus size={20} />
            Create Proposal
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8 border-b border-stone-800 pb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`text-sm font-medium pb-4 -mb-4 transition-colors ${
              activeFilter === f.key
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-stone-500 hover:text-stone-300 border-b-2 border-transparent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-stone-900 border border-stone-800 p-12">
          <CircleNotch className="animate-spin text-stone-500 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-stone-100 mb-2">Loading Proposals...</h3>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-stone-900 border border-stone-800 p-12">
          <p className="text-red-500 mb-4">Error loading proposals</p>
          <pre className="text-xs text-stone-500">{error}</pre>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-stone-900 border border-stone-800 p-12">
          <Scroll size={48} className="text-stone-500 mb-4" />
          {proposals.length === 0 ? (
            <>
              <h3 className="text-lg font-semibold text-stone-100 mb-2">No proposals yet</h3>
              <p className="text-stone-500 max-w-md text-center mb-4">
                There are no governance proposals right now. Be the first to create one for the community to vote on.
              </p>
              {isConnected && (
                <Link href="/proposals/create" className="text-emerald-400 hover:underline">
                  Create your first proposal
                </Link>
              )}
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-stone-100 mb-2">No matching proposals</h3>
              <p className="text-stone-500 max-w-md text-center">
                No proposals match the &ldquo;{activeFilter}&rdquo; filter. Try a different filter.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredProposals.map((proposal) => (
            <ProposalListItem key={proposal.proposalId} proposal={proposal} />
          ))}
        </div>
      )}
    </main>
  );
}
