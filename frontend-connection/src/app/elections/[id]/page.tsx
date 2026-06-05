"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { CONTRACTS, electionAbi, sbtAbi } from "@/lib/contracts";
import { ArrowLeft, Users, HandsClapping, CheckCircle, XCircle, CircleNotch, Warning } from "@phosphor-icons/react";
import { config } from "@/lib/wagmi";
import Link from "next/link";

export default function ElectionDetailPage() {
  const params = useParams();
  const electionId = Number(params.id);
  const { address, isConnected } = useAccount();
  const [voting, setVoting] = useState(false);
  const [votedCandidate, setVotedCandidate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: electionInfo, isLoading: loadingInfo } = useReadContract({
    address: CONTRACTS.CampusElection,
    abi: electionAbi,
    functionName: "getElectionInfo",
    args: [BigInt(electionId)],
  });

  const { data: hasPass } = useReadContract({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    functionName: "hasPass",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: hasVoted } = useReadContract({
    address: CONTRACTS.CampusElection,
    abi: electionAbi,
    functionName: "hasVotedInElection",
    args: address ? [BigInt(electionId), address] : undefined,
    query: { enabled: !!address },
  });

  const { data: candidateCount } = useReadContract({
    address: CONTRACTS.CampusElection,
    abi: electionAbi,
    functionName: "getCandidateCount",
    args: [BigInt(electionId)],
  });

  const { writeContractAsync } = useWriteContract();

  const [candidates, setCandidates] = useState<Array<{index: number, name: string, description: string, voteCount: number}>>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!candidateCount || !publicClient) {
        setLoadingCandidates(false);
        return;
      }
      const count = Number(candidateCount);
      const cands = [];
      for (let i = 0; i < count; i++) {
        try {
          const res = await publicClient.readContract({
            address: CONTRACTS.CampusElection,
            abi: electionAbi,
            functionName: "candidates",
            args: [BigInt(electionId), BigInt(i)],
          });
          // The candidates function returns a tuple: (name, description, voteCount, exists)
          if (res && Array.isArray(res) && res.length >= 3) {
            cands.push({
              index: i,
              name: res[0] || `Candidate ${i + 1}`,
              description: res[1] || "",
              voteCount: Number(res[2] || 0),
            });
          } else {
            cands.push({
              index: i,
              name: `Candidate ${i + 1}`,
              description: "",
              voteCount: 0,
            });
          }
        } catch (e) {
          cands.push({
            index: i,
            name: `Candidate ${i + 1}`,
            description: "",
            voteCount: 0,
          });
        }
      }
      setCandidates(cands);
      setLoadingCandidates(false);
    };
    fetchCandidates();
  }, [electionId, candidateCount]);

  const handleVote = async (candidateIndex: number) => {
    if (!address || !hasPass || hasVoted) return;
    
    try {
      setVoting(true);
      setError(null);
      await writeContractAsync({
        address: CONTRACTS.CampusElection,
        abi: electionAbi,
        functionName: "vote",
        args: [BigInt(electionId), BigInt(candidateIndex)],
      });
      setVotedCandidate(candidateIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to vote");
    } finally {
      setVoting(false);
    }
  };

  if (loadingInfo) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <CircleNotch className="animate-spin text-stone-500" size={48} />
      </main>
    );
  }

  if (!electionInfo) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-col items-center justify-center rounded-xl bg-stone-900 border border-stone-800 p-12">
          <XCircle size={48} className="text-stone-500 mb-4" />
          <h3 className="text-lg font-semibold text-stone-100 mb-2">Election Not Found</h3>
        </div>
      </main>
    );
  }

  const [title, description, startTime, endTime, totalCandidates, isFinalized] = electionInfo as [string, string, bigint, bigint, bigint, boolean];
  const now = Math.floor(Date.now() / 1000);
  const isActive = Number(startTime) <= now && Number(endTime) >= now;
  const isEnded = Number(endTime) < now;

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/elections"
        className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-200 mb-8"
      >
        <ArrowLeft size={16} />
        Back to Elections
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-100 mb-2">{title}</h1>
        <p className="text-stone-400">{description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <h3 className="text-sm font-medium text-stone-400 mb-2">Start Time</h3>
          <p className="text-stone-100">{new Date(Number(startTime) * 1000).toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
          <h3 className="text-sm font-medium text-stone-400 mb-2">End Time</h3>
          <p className="text-stone-100">{new Date(Number(endTime) * 1000).toLocaleString()}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-stone-100 flex items-center gap-2">
          <Users size={20} />
          Candidates
        </h2>

        {!isConnected ? (
          <div className="rounded-xl bg-stone-900 border border-stone-800 p-8 text-center">
            <Warning size={32} className="text-stone-400 mx-auto mb-3" />
            <p className="text-stone-400">Connect your wallet to view candidates and vote.</p>
          </div>
        ) : !hasPass ? (
          <div className="rounded-xl bg-stone-900 border border-stone-800 p-8 text-center">
            <Warning size={32} className="text-yellow-500 mx-auto mb-3" />
            <p className="text-stone-400">You need a Campus Pass to vote in this election.</p>
          </div>
        ) : hasVoted ? (
          <div className="rounded-xl bg-stone-900 border border-green-500/20 p-8 text-center">
            <CheckCircle size={32} className="text-green-500 mx-auto mb-3" />
            <p className="text-stone-100 font-medium mb-1">You have already voted</p>
            <p className="text-stone-400 text-sm">Thank you for participating in this election.</p>
          </div>
        ) : !isActive ? (
          <div className="rounded-xl bg-stone-900 border border-stone-800 p-8 text-center">
            <p className="text-stone-400">
              {isEnded ? "This election has ended." : "This election has not started yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {loadingCandidates ? (
              <div className="rounded-xl bg-stone-900 border border-stone-800 p-8 text-center">
                <CircleNotch className="animate-spin text-stone-400 mx-auto mb-3" size={24} />
                <p className="text-stone-400">Loading candidates...</p>
              </div>
            ) : candidates.length === 0 ? (
              <div className="rounded-xl bg-stone-900 border border-stone-800 p-8 text-center">
                <p className="text-stone-400">No candidates added to this election yet.</p>
              </div>
            ) : (
              candidates.map((candidate) => (
                <div
                  key={candidate.index}
                  className="rounded-xl bg-stone-900 border border-stone-800 p-6 hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-stone-100">{candidate.name}</h3>
                    <span className="text-sm text-stone-500">Votes: {candidate.voteCount}</span>
                  </div>
                  {candidate.description && (
                    <p className="text-sm text-stone-400 mb-4">{candidate.description}</p>
                  )}
                  <button
                    disabled={voting}
                    onClick={() => handleVote(candidate.index)}
                    className="inline-flex items-center gap-2 w-full justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 text-sm font-medium disabled:opacity-50"
                  >
                    {votedCandidate === candidate.index ? (
                      <>
                        <CheckCircle size={18} />
                        Vote Submitted
                      </>
                    ) : voting ? (
                      <>
                        <CircleNotch className="animate-spin" size={18} />
                        Voting...
                      </>
                    ) : (
                      <>
                        <HandsClapping size={18} />
                        Vote for {candidate.name}
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {isEnded && !loadingCandidates && candidates.length > 0 && (
          <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
            <h3 className="text-lg font-semibold text-stone-100 mb-4">Final Results</h3>
            <div className="space-y-3">
              {candidates.map((candidate) => {
                const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
                const percentage = totalVotes > 0 ? (candidate.voteCount / totalVotes) * 100 : 0;
                return (
                  <div key={candidate.index} className="space-y-1">
                    <div className="flex justify-between text-sm text-stone-300">
                      <span>{candidate.name}</span>
                      <span>{candidate.voteCount} votes ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
