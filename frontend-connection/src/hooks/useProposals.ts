"use client";

import { useEffect, useState, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { governorAbi, CONTRACTS } from "@/lib/contracts";

export interface Proposal {
  proposalId: string;
  proposer: string;
  description: string;
  voteStart: string;
  voteEnd: string;
}

export function useProposals() {
  const publicClient = usePublicClient();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = useCallback(async () => {
    if (!publicClient) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const blockNumber = await publicClient.getBlockNumber();
      
      // Contract was deployed around block 10990700 on Sepolia.
      // We can safely fetch from a bit before that.
      const DEPLOYMENT_BLOCK = BigInt(10990000);
      const fromBlock = DEPLOYMENT_BLOCK;

      try {
        const logs = await publicClient.getContractEvents({
          address: CONTRACTS.CampusGovernor,
          abi: governorAbi,
          eventName: "ProposalCreated",
          fromBlock,
          toBlock: blockNumber,
        });

        const proposalData: Proposal[] = logs.map((log) => ({
          proposalId: (log.args as any).proposalId.toString(),
          proposer: (log.args as any).proposer,
          description: (log.args as any).description,
          voteStart: (log.args as any).voteStart.toString(),
          voteEnd: (log.args as any).voteEnd.toString(),
        }));

        setProposals(proposalData.reverse());
      } catch (fetchError) {
        console.warn("Failed to fetch proposals from RPC:", fetchError);
        setProposals([]);
        setError("RPC limit exceeded or connection failed. Try refreshing or changing RPC.");
      }
    } catch (err) {
      console.error("Failed to fetch proposals:", err);
      setProposals([]);
      setError("Unable to load proposals.");
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return { proposals, isLoading, error, refetch: fetchProposals };
}
