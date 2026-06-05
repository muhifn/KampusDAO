"use client";

import { useAccount, useReadContract } from "wagmi";
import { useProposals } from "@/hooks/useProposals";
import { CircleNotch, Plus, Scroll } from "@phosphor-icons/react";
import Link from "next/link";
import { ProposalListItem } from "@/components/dao/ProposalListItem";

export default function DaoPage() {
  const { isConnected } = useAccount();
  const { proposals, isLoading } = useProposals();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:py-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-100">
            DAO Dashboard
          </h1>
          <p className="mt-2 text-stone-400">
            Governance proposals and voting for KampusDAO
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

      {/* Stats Overview */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-400">
              <Scroll size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-100">{isLoading ? '-' : proposals.length}</div>
              <div className="text-xs text-stone-500">Total Proposals</div>
            </div>
          </div>
        </div>
        {/* ... you would count proposals by state if state fetching is added to the hook, currently we just list 0s for the rest */}
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500/10 p-2 text-green-400">
              <CircleNotch size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-100">-</div>
              <div className="text-xs text-stone-500">Active</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-400">
              <CircleNotch size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-100">-</div>
              <div className="text-xs text-stone-500">Succeeded</div>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-stone-500/10 p-2 text-stone-400">
              <CircleNotch size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-100">-</div>
              <div className="text-xs text-stone-500">Executed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-stone-100 mb-6">Recent Proposals</h2>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-stone-900 border border-stone-800 p-12">
            <CircleNotch className="animate-spin text-stone-500 mb-4" size={48} />
            <p className="text-stone-500">Loading proposals...</p>
          </div>
        ) : proposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl bg-stone-900 border border-stone-800 p-12">
            <Scroll size={48} className="text-stone-500 mb-4" />
            <p className="text-stone-500">
              No proposals yet. Create the first one!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {proposals.slice(0, 5).map((proposal) => (
              <ProposalListItem key={proposal.proposalId} proposal={proposal} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
