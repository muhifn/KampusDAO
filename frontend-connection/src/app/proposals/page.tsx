"use client";

import { useAccount } from "wagmi";
import { Scroll, Plus, CircleNotch } from "@phosphor-icons/react";
import Link from "next/link";
import { useProposals } from "@/hooks/useProposals";
import { ProposalListItem } from "@/components/dao/ProposalListItem";

export default function ProposalsPage() {
  const { isConnected } = useAccount();
  const { proposals, isLoading, error } = useProposals();

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
        <button className="text-sm font-medium text-emerald-400 border-b-2 border-emerald-400 pb-4 -mb-4">
          All
        </button>
        <button className="text-sm font-medium text-stone-500 hover:text-stone-300 pb-4 -mb-4">
          Active
        </button>
        <button className="text-sm font-medium text-stone-500 hover:text-stone-300 pb-4 -mb-4">
          Succeeded
        </button>
        <button className="text-sm font-medium text-stone-500 hover:text-stone-300 pb-4 -mb-4">
          Executed
        </button>
        <button className="text-sm font-medium text-stone-500 hover:text-stone-300 pb-4 -mb-4">
          Defeated
        </button>
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
      ) : proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-stone-900 border border-stone-800 p-12">
          <Scroll size={48} className="text-stone-500 mb-4" />
          {isConnected ? (
            <>
              <h3 className="text-lg font-semibold text-stone-100 mb-2">No proposals yet</h3>
              <p className="text-stone-500 max-w-md text-center mb-4">
                There are no governance proposals right now. Be the first to create one for the community to vote on.
              </p>
              <Link href="/proposals/create" className="text-emerald-400 hover:underline">
                Create your first proposal
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-stone-100 mb-2">Connect to view proposals</h3>
              <p className="text-stone-500 max-w-md text-center">
                Connect your wallet to browse and vote on active governance proposals.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {proposals.map((proposal) => (
            <ProposalListItem key={proposal.proposalId} proposal={proposal} />
          ))}
        </div>
      )}
    </main>
  );
}
