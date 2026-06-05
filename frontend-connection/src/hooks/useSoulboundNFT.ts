import { useAccount, useReadContract, useWriteContract, useWatchContractEvent } from "wagmi";
import { CONTRACTS, sbtAbi } from "@/lib/contracts";

export function useSoulboundNFT() {
  const { address } = useAccount();

  const {
    data: hasPass,
    isLoading: isLoadingPass,
    refetch: refetchPass,
    error: passError
  } = useReadContract({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    functionName: "hasPass",
    args: address ? [address] : undefined,
  });

  const {
    data: isWhitelisted,
    isLoading: isLoadingWhitelist
  } = useReadContract({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    functionName: "isWhitelisted",
    args: address ? [address] : undefined,
  });

  const {
    data: tokenId,
    isLoading: isLoadingToken
  } = useReadContract({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    functionName: "getPassTokenId",
    args: address ? [address] : undefined,
  });

  const { data: isLocked } = useReadContract({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    functionName: "locked",
    args: tokenId ? [tokenId] : undefined,
  });

  const { data: totalPasses } = useReadContract({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    functionName: "totalPasses",
  });

  const { writeContractAsync: claimPass, isPending: isClaiming } = useWriteContract();

  const { writeContractAsync: burnPass, isPending: isBurning } = useWriteContract();

  useWatchContractEvent({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    eventName: "PassClaimed",
    onLogs: () => {
      refetchPass();
    },
  });

  useWatchContractEvent({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    eventName: "PassRevoked",
    onLogs: () => {
      refetchPass();
    },
  });

  return {
    hasPass,
    isWhitelisted,
    tokenId,
    isLocked,
    totalPasses,
    isLoading: isLoadingPass || isLoadingWhitelist || isLoadingToken,
    passError,
    claimPass,
    isClaiming,
    burnPass,
    isBurning,
    refetchPass,
  };
}