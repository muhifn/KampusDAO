"use client";

import { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { useAdmin } from "@/hooks/useAdmin";
import { CONTRACTS, sbtAbi } from "@/lib/contracts";
import { WhitelistRequest } from "@/lib/memdb";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trash,
  Shield,
  User,
  CircleNotch,
  Users,
} from "@phosphor-icons/react";
import Link from "next/link";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { isAdmin, isLoading: isAdminLoading } = useAdmin(address);
  const { writeContractAsync, isPending } = useWriteContract();

  const [requests, setRequests] = useState<WhitelistRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revokeAddress, setRevokeAddress] = useState("");

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin]);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/whitelist");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load whitelist requests");
      }
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load requests");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (req: WhitelistRequest) => {
    try {
      setError(null);
      await writeContractAsync({
        address: CONTRACTS.CampusSoulboundNFT,
        abi: sbtAbi,
        functionName: "addToWhitelist",
        args: [req.walletAddress as `0x${string}`],
        gas: BigInt(300_000),
      });

      await fetch("/api/whitelist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: req.id, status: "approved" }),
      });

      fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    }
  };

  const handleReject = async (req: WhitelistRequest) => {
    try {
      setError(null);
      await fetch("/api/whitelist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: req.id, status: "rejected" }),
      });
      fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject");
    }
  };

  const handleRevoke = async () => {
    try {
      setError(null);
      await writeContractAsync({
        address: CONTRACTS.CampusSoulboundNFT,
        abi: sbtAbi,
        functionName: "removeFromWhitelist",
        args: [revokeAddress as `0x${string}`],
        gas: BigInt(300_000),
      });
      setRevokeAddress("");
      setError("Successfully removed from whitelist");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke");
    }
  };

  if (!isConnected || isAdminLoading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <CircleNotch className="animate-spin text-stone-500" size={48} />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12 md:py-24">
        <div className="flex flex-col items-center justify-center rounded-xl bg-stone-900 border border-stone-800 p-12">
          <XCircle size={48} className="text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-stone-100 mb-2">Access Denied</h3>
          <p className="text-stone-500 text-center">
            You do not have the required admin permissions to view this page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-200 mb-8"
      >
        <ArrowLeft size={16} />
        Back to Profile
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <Shield size={32} className="text-emerald-400" />
        <h1 className="text-3xl font-bold tracking-tight text-stone-100">
          Admin Dashboard
        </h1>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Link
          href="/admin/elections"
          className="rounded-xl bg-stone-900 border border-stone-800 p-6 hover:border-emerald-500/40 transition-colors"
        >
          <Users size={24} className="text-emerald-400 mb-2" />
          <h3 className="text-lg font-semibold text-stone-100">Manage Elections</h3>
          <p className="text-sm text-stone-400">
            Create elections and add candidates
          </p>
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Whitelist Requests */}
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <h2 className="text-xl font-semibold text-stone-100 mb-4 flex items-center gap-2">
            <User size={20} />
            Whitelist Requests
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <CircleNotch className="animate-spin text-stone-500" size={24} />
            </div>
          ) : requests.filter((r) => r.status === "pending").length === 0 ? (
            <p className="text-stone-500 text-center py-8">
              No pending requests.
            </p>
          ) : (
            <div className="space-y-4">
              {requests
                .filter((r) => r.status === "pending")
                .map((req) => (
                  <div
                    key={req.id}
                    className="rounded-lg border border-stone-800 p-4 bg-stone-900/50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-stone-100">
                          {req.name}
                        </h3>
                        <p className="text-xs text-stone-500">
                          Student ID: {req.studentId}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-stone-400 bg-stone-800 px-2 py-1 rounded">
                        {req.walletAddress.slice(0, 6)}...
                        {req.walletAddress.slice(-4)}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleApprove(req)}
                        disabled={isPending}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-sm font-medium disabled:opacity-50"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(req)}
                        disabled={isPending}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-2 text-sm font-medium disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Manual Revoke */}
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <h2 className="text-xl font-semibold text-stone-100 mb-4 flex items-center gap-2">
            <Trash size={20} />
            Revoke Whitelist
          </h2>
          <p className="text-sm text-stone-400 mb-4">
            Manually remove a wallet address from the whitelist.
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={revokeAddress}
              onChange={(e) => setRevokeAddress(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <button
              onClick={handleRevoke}
              disabled={!revokeAddress || isPending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {isPending ? (
                <CircleNotch className="animate-spin" size={16} />
              ) : (
                <Trash size={16} />
              )}
              Revoke Access
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
