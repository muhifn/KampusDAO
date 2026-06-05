"use client";

import { useReadContract } from "wagmi";
import { sbtAbi, CONTRACTS } from "@/lib/contracts";

const ADMIN_ROLE = "0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775";

export function useAdmin(address: string | undefined) {
  const { data: isAdmin, isLoading } = useReadContract({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    functionName: "hasRole",
    args: address ? [ADMIN_ROLE, address as `0x${string}`] : undefined,
    query: { enabled: !!address }
  });

  return { isAdmin: !!isAdmin, isLoading };
}
