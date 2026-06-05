// CampusDAO Contract Addresses & ABIs (Sepolia Testnet)
// Generated from: forge build

// ==========================================
// 1. CONTRACT ADDRESSES
// ==========================================

export const CONTRACTS = {
  CampusSoulboundNFT: "0x0172a46550252FE59249A4c08fF6C36056c5032B" as const,
  TimelockController: "0x735201b8E72Bd56Ab4596f40e84c4F13A1E6F1fD" as const,
  CampusGovernor: "0x1E5E73ED5fe23e0288cbcBc093bde2B286c21e80" as const,
} as const;

// ==========================================
// 2. ABIs (Truncated for common operations)
// ==========================================

export const sbtAbi = [
  {
    name: "claimPass",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "hasPass",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "student", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "isWhitelisted",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "student", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "locked",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "burnPass",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "ownerOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "getVotes",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const governorAbi = [
  {
    name: "propose",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "targets", type: "address[]" },
      { name: "values", type: "uint256[]" },
      { name: "calldatas", type: "bytes[]" },
      { name: "description", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "castVote",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "support", type: "uint8" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "state",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [{ name: "", type: "uint8" }],
  },
  {
    name: "proposalDeadline",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "proposalVotes",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [
      { name: "againstVotes", type: "uint256" },
      { name: "forVotes", type: "uint256" },
      { name: "abstainVotes", type: "uint256" },
    ],
  },
] as const;

// ==========================================
// 3. FULL ABIs (Import from out/ folder)
// ==========================================
// For full wagmi/viem integration, import full ABIs:
// import fullSbtAbi from "../../out/CampusSoulboundNFT.abi.json";
// import fullGovernorAbi from "../../out/CampusGovernor.abi.json";