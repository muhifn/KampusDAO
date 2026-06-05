"use client";

import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useReadContract } from "wagmi";
import { CONTRACTS, electionAbi } from "@/lib/contracts";
import { CircleNotch, Plus, Users, HandsClapping, Calendar } from "@phosphor-icons/react";
import Link from "next/link";

export default function ElectionsPage() {
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [elections, setElections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: electionIds } = useReadContract({
    address: CONTRACTS.CampusElection,
    abi: electionAbi,
    functionName: "getAllElectionIds",
  });

  useEffect(() => {
    const fetchAll = async () => {
      if (!publicClient || !electionIds || electionIds.length === 0) {
        setElections([]);
        setIsLoading(false);
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const results: any[] = [];

      for (const id of Array.from(electionIds)) {
        try {
          const electionId = Number(id);
          const data = await publicClient.readContract({
            address: CONTRACTS.CampusElection,
            abi: electionAbi,
            functionName: "getElectionInfo",
            args: [BigInt(electionId)],
          });
          const [title, description, startTime, endTime, totalCandidates, isFinalized] = data as [string, string, bigint, bigint, bigint, boolean];
          const startTimeNum = Number(startTime);
          const endTimeNum = Number(endTime);
          results.push({
            id: electionId,
            title: title || `Election #${electionId}`,
            description,
            startTime: startTimeNum,
            endTime: endTimeNum,
            totalCandidates: Number(totalCandidates),
            isActive: startTimeNum <= now && endTimeNum >= now,
          });
        } catch (err) {
          console.error(err);
        }
      }
      setElections(results);
      setIsLoading(false);
    };
    fetchAll();
  }, [publicClient, electionIds]);

  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <CircleNotch className="animate-spin text-stone-500" size={48} />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-12 md:py-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-100">
            Elections
          </h1>
          <p className="mt-2 text-stone-400">
            Vote in campus elections
          </p>
        </div>
        {isConnected && (
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-400"
          >
            <Plus size={20} />
            Create Election
          </Link>
        )}
      </div>

      {elections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl bg-stone-900 border border-stone-800 p-12">
          <Users size={48} className="text-stone-500 mb-4" />
          <h3 className="text-lg font-semibold text-stone-100 mb-2">No elections yet</h3>
          <p className="text-stone-500 max-w-md text-center">
            Check back later for campus elections.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {elections.map((election) => {
            const displayTitle = election.title.startsWith('Election #') ? election.title : 
              `Election #${election.id}`;
            const displayTime = election.startTime > 0 ? 
              `Starts: ${new Date(election.startTime * 1000).toLocaleString()}` : 'TBD';
            const statusBadge = election.isActive ? 
              { label: "Active", color: "bg-green-500/10 text-green-400 border-green-500/20" } :
              { label: "Upcoming", color: "bg-stone-800 text-stone-300 border-stone-700" };
            
            return (
              <div
                key={election.id}
                className="rounded-xl bg-stone-900 border border-stone-800 p-6 hover:border-emerald-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                    <Calendar size={14} />
                    {statusBadge.label}
                  </span>
                  <span className="text-xs text-stone-500">ID: {election.id}</span>
                </div>
                <h3 className="text-lg font-semibold text-stone-100 mb-2">{displayTitle}</h3>
                {election.description && (
                  <p className="text-sm text-stone-400 mb-3">{election.description}</p>
                )}
                <div className="flex items-center gap-3 text-sm text-stone-400 mb-2">
                  <Users size={16} />
                  <span>Candidates: {election.totalCandidates}</span>
                </div>
                <p className="text-xs text-stone-500 mb-6">{displayTime}</p>
                <div>
                  <Link
                    href={`/elections/${election.id}`}
                    className="inline-flex items-center gap-2 w-full justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 text-sm font-medium transition-colors"
                  >
                    <HandsClapping size={18} />
                    Vote Now
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
