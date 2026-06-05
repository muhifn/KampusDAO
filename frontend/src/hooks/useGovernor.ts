import { useReadContract, useWriteContract, useWatchContractEvent } from "wagmi";
import { CONTRACTS, governorAbi } from "@/lib/contracts";

export type ProposalState = "Pending" | "Active" | "Canceled" | "Defeated" | "Succeeded" | "Queued" | "Expired" | "Executed";

export function useGovernor() {
  const { 
    writeContractAsync: castVote, 
    isPending: isVoting 
  } = useWriteContract();

  const { writeContractAsync: propose, isPending: isProposing } = useWriteContract();

  useWatchContractEvent({
    address: CONTRACTS.CampusGovernor,
    abi: governorAbi,
    eventName: "ProposalCreated",
    onLogs: (logs) => {
      console.log("New proposal created!", logs);
    },
  });

  useWatchContractEvent({
    address: CONTRACTS.CampusGovernor,
    abi: governorAbi,
    eventName: "VoteCast",
    onLogs: (logs) => {
      console.log("Vote cast successfully!", logs);
    },
  });

  return {
    castVote,
    isVoting,
    propose,
    isProposing,
  };
}