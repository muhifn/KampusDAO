"use client";

import { useAccount } from "wagmi";
import { useSoulboundNFT } from "@/hooks/useSoulboundNFT";
import { NFTBadge } from "@/components/nft/NFTBadge";
import { MintButton } from "@/components/nft/MintButton";
import { SealCheck, UsersThree, Scroll } from "@phosphor-icons/react";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { totalPasses, isLoading: isLoadingPass } = useSoulboundNFT();

  return (
    <main className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-24">
      {/* Hero Section */}
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-stone-100">
          KampusDAO
        </h1>
        <p className="mt-6 text-lg text-stone-400 max-w-xl mx-auto">
          Decentralized governance for campus communities.
          Claim your Soulbound Pass, create proposals, and vote on important matters.
        </p>

        <div className="mt-10 flex flex-col items-center gap-6">
          {!isConnected ? (
            <div className="rounded-xl bg-stone-900 border border-stone-800 p-6 max-w-md w-full">
              <p className="text-center text-stone-400">
                Connect your wallet to check eligibility and claim your pass.
              </p>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-4">
              <NFTBadge address={address!} />
              <MintButton address={address!} />
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl w-full">
        <div className="flex flex-col items-center rounded-xl bg-stone-900 p-6 border border-stone-800">
          <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400">
            <SealCheck size={28} />
          </div>
          <div className="mt-4 text-2xl font-bold text-stone-100">
            {isLoadingPass ? "..." : String(totalPasses ?? 0)}
          </div>
          <div className="mt-1 text-sm text-stone-500">Passes Claimed</div>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-stone-900 p-6 border border-stone-800">
          <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400">
            <UsersThree size={28} />
          </div>
          <div className="mt-4 text-2xl font-bold text-stone-100">
            {isLoadingPass ? "..." : String(totalPasses ?? 0)}
          </div>
          <div className="mt-1 text-sm text-stone-500">Members</div>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-stone-900 p-6 border border-stone-800">
          <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-400">
            <Scroll size={28} />
          </div>
          <div className="mt-4 text-2xl font-bold text-stone-100">0</div>
          <div className="mt-1 text-sm text-stone-500">Proposals</div>
        </div>
      </div>
    </main>
  );
}