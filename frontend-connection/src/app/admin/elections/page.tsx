"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { useAdmin } from "@/hooks/useAdmin";
import { CONTRACTS, electionAbi } from "@/lib/contracts";
import { ArrowLeft, Users, Calendar, Plus, CircleNotch, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";

export default function AdminElectionsPage() {
  const { address, isConnected } = useAccount();
  const { isAdmin } = useAdmin(address);
  const { writeContractAsync, isPending } = useWriteContract();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [electionId, setElectionId] = useState<number | undefined>(undefined);
  const [candidateName, setCandidateName] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateElection = async () => {
    try {
      setError(null);
      setSuccess(null);
      const startTs = Math.floor(new Date(startTime).getTime() / 1000);
      const endTs = Math.floor(new Date(endTime).getTime() / 1000);
      
      await writeContractAsync({
        address: CONTRACTS.CampusElection,
        abi: electionAbi,
        functionName: "createElection",
        args: [title, description, BigInt(startTs), BigInt(endTs)],
        gas: BigInt(300_000),
      });
      setSuccess("Election created successfully!");
      setTitle("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create election");
    }
  };

  const handleAddCandidate = async () => {
    if (!electionId || !candidateName) return;
    try {
      setError(null);
      setSuccess(null);
      await writeContractAsync({
        address: CONTRACTS.CampusElection,
        abi: electionAbi,
        functionName: "addCandidate",
        args: [BigInt(electionId), candidateName, ""],
        gas: BigInt(300_000),
      });
      setSuccess(`Candidate "${candidateName}" added to election ${electionId}`);
      setCandidateName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add candidate");
    }
  };

  if (!isConnected || !isAdmin) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <p className="text-stone-400">Access Denied. Connect as admin.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-200 mb-8"
      >
        <ArrowLeft size={16} />
        Admin Dashboard
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-stone-100 mb-8 flex items-center gap-3">
        <Users size={32} className="text-emerald-400" />
        Manage Elections
      </h1>

      {success && (
        <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-sm text-green-400">
          {success}
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        {/* Create Election */}
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <h2 className="text-xl font-semibold text-stone-100 mb-4 flex items-center gap-2">
            <Plus size={20} />
            Create Election
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Ketua BEM 2025"
                className="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-2 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the election..."
                rows={3}
                className="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-2 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Start</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-2 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">End</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-2 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
            <button
              onClick={handleCreateElection}
              disabled={!title || !startTime || !endTime || isPending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 text-sm font-medium disabled:opacity-50"
            >
              {isPending ? <CircleNotch className="animate-spin" size={18} /> : <Plus size={18} />}
              Create Election
            </button>
          </div>
        </div>

        {/* Add Candidate */}
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <h2 className="text-xl font-semibold text-stone-100 mb-4 flex items-center gap-2">
            <Users size={20} />
            Add Candidate
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Election ID</label>
              <input
                type="number"
                value={electionId ?? ""}
                onChange={(e) => setElectionId(Number(e.target.value))}
                placeholder="Enter election ID"
                className="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-2 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-1">Candidate Name</label>
              <input
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g., Budi Santoso"
                className="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-2 text-sm text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <button
              onClick={handleAddCandidate}
              disabled={!electionId || !candidateName || isPending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 text-sm font-medium disabled:opacity-50"
            >
              {isPending ? <CircleNotch className="animate-spin" size={18} /> : <Plus size={18} />}
              Add Candidate
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
