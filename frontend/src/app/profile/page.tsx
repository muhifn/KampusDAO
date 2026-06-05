"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { NFTBadge } from "@/components/nft/NFTBadge";
import { MintButton } from "@/components/nft/MintButton";
import { useSoulboundNFT } from "@/hooks/useSoulboundNFT";
import { User, Copy, Scroll, CheckCircle } from "@phosphor-icons/react";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { hasPass, isWhitelisted } = useSoulboundNFT();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  if (!isConnected) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <User size={48} className="mx-auto text-stone-500 mb-4" />
          <p className="text-stone-500">Connect your wallet to view your profile</p>
        </div>
      </main>
    );
  }

  const handleRequestWhitelist = async () => {
    if (!name || !studentId || !address) return;
    setIsSubmitting(true);
    setRequestError(null);

    try {
      const res = await fetch("/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, name, studentId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }
      setSubmitted(true);
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : "Failed to submit request");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showRequestForm = !isWhitelisted && !hasPass && !submitted;
  const showSubmitted = submitted && !isWhitelisted && !hasPass;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-100">Profile</h1>
        <p className="mt-2 text-stone-400">
          View your Campus Pass and manage your access
        </p>
      </div>

      <div className="space-y-6">
        {/* Wallet Info */}
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <h2 className="text-lg font-semibold text-stone-100 mb-4">Wallet</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-400">
                <User size={20} />
              </div>
              <div>
                <div className="text-sm text-stone-500">Connected Address</div>
                <div className="font-mono text-sm text-stone-200">{address}</div>
              </div>
            </div>
            <button className="text-stone-500 hover:text-stone-300">
              <Copy size={20} />
            </button>
          </div>
        </div>

        {/* NFT Badge */}
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <h2 className="text-lg font-semibold text-stone-100 mb-4">Campus Pass</h2>
          <NFTBadge address={address!} />
          <div className="mt-4">
            <MintButton address={address!} />
          </div>
        </div>

        {/* Request Whitelist Form */}
        {showRequestForm && (
          <div className="rounded-xl bg-stone-900 border border-emerald-500/20 p-6">
            <h2 className="text-lg font-semibold text-stone-100 mb-2">Request Whitelist Access</h2>
            <p className="text-sm text-stone-400 mb-4">
              You are not whitelisted yet. Complete this form to request access from the administrator.
            </p>
            {requestError && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">
                {requestError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Student ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter your student ID"
                  className="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <button
                onClick={handleRequestWhitelist}
                disabled={!name || !studentId || isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-400 disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        )}

        {showSubmitted && (
          <div className="rounded-xl bg-stone-900 border border-green-500/20 p-6">
            <div className="flex flex-col items-center text-center py-4">
              <CheckCircle size={32} className="text-green-500 mb-3" />
              <h3 className="text-lg font-semibold text-stone-100 mb-1">Request Submitted</h3>
              <p className="text-sm text-stone-400">
                Please wait for the administrator to approve your whitelist request.
              </p>
            </div>
          </div>
        )}

        {/* Voting History */}
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <h2 className="text-lg font-semibold text-stone-100 mb-4">Voting History</h2>
          <div className="flex flex-col items-center justify-center py-8">
            <Scroll size={32} className="text-stone-600 mb-3" />
            <p className="text-stone-500">No voting history yet</p>
            <p className="text-sm text-stone-600 mt-1">
              Your votes will appear here once you participate in governance proposals
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
