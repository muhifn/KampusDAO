// KampusDAO Contract Addresses & ABIs (Sepolia Testnet)
// Generated from: forge build + deployed to Sepolia

export const CONTRACTS = {
  CampusSoulboundNFT: "0x51a780B6633E8D2ccAe59B1a48F47d3cfD0A5256" as const,
  TimelockController: "0x282Fa321CE97b20136853A12B787F898E6c3E3A8" as const,
  CampusGovernor: "0xAD7FD095874AEc5750fE8EBbD9f51624102BC8Bd" as const,
  CampusElection: "0xeD0bA9dc3639CFB58e66C593A567e158e01e9332" as const,
} as const;

// IPFS Configuration
export const IPFS_BASE_URI = "ipfs://bafybeigrwgyqrf52qaeizfyuqsrzuzoyqpmdpe7eghytg5g3dihudr6fo4/";
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/bafybeigrwgyqrf52qaeizfyuqsrzuzoyqpmdpe7eghytg5g3dihudr6fo4/";

export const sbtAbi = [
  {
    name: "addToWhitelist",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "student", type: "address" }],
    outputs: [],
  },
  {
    name: "hasRole",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" }
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "removeFromWhitelist",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "student", type: "address" }],
    outputs: [],
  },
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
    name: "burnPass",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "getPassTokenId",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "student", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "locked",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "supportsInterface",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "interfaceId", type: "bytes4" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "tokenURI",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "totalPasses",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "PassClaimed",
    type: "event",
    inputs: [
      { name: "student", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: false },
      { name: "claimedAt", type: "uint256", indexed: false }
    ]
  },
  {
    name: "PassRevoked",
    type: "event",
    inputs: [
      { name: "student", type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: false }
    ]
  },
] as const;

export const governorAbi = [
  {
    name: "soulboundNFT",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
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
      { name: "support", type: "uint8" }, // 0=Against, 1=For, 2=Abstain
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
  {
    name: "ProposalCreated",
    type: "event",
    inputs: [
      { name: "proposalId", type: "uint256", indexed: false },
      { name: "proposer", type: "address", indexed: false },
      { name: "targets", type: "address[]", indexed: false },
      { name: "values", type: "uint256[]", indexed: false },
      { name: "signatures", type: "string[]", indexed: false },
      { name: "calldatas", type: "bytes[]", indexed: false },
      { name: "voteStart", type: "uint256", indexed: false },
      { name: "voteEnd", type: "uint256", indexed: false },
      { name: "description", type: "string", indexed: false },
    ],
  },
  {
    name: "VoteCast",
    type: "event",
    inputs: [
      { name: "voter", type: "address", indexed: true },
      { name: "proposalId", type: "uint256", indexed: false },
      { name: "support", type: "uint8", indexed: false },
      { name: "weight", type: "uint256", indexed: false },
      { name: "reason", type: "string", indexed: false },
    ],
  },
  {
    name: "NoCampusPass",
    type: "error",
    inputs: [],
  },
] as const;

export const electionAbi = [
  {
    name: "createElection",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "addCandidate",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "electionId", type: "uint256" },
      { name: "name", type: "string" },
      { name: "description", type: "string" },
    ],
    outputs: [],
  },
  {
    name: "vote",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "electionId", type: "uint256" },
      { name: "candidateIndex", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "getResults",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "electionId", type: "uint256" }],
    outputs: [
      { name: "names", type: "string[]" },
      { name: "votes", type: "uint256[]" },
    ],
  },
  {
    name: "getElectionInfo",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "electionId", type: "uint256" }],
    outputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "totalCandidates", type: "uint256" },
      { name: "isFinalized", type: "bool" },
    ],
  },
  {
    name: "getAllElectionIds",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "hasVotedInElection",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "electionId", type: "uint256" },
      { name: "voter", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getVoterChoice",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "electionId", type: "uint256" },
      { name: "voter", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "isElectionActive",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "electionId", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getCandidateCount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "electionId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "candidates",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "electionId", type: "uint256" },
      { name: "", type: "uint256" },
    ],
    outputs: [
      { name: "name", type: "string" },
      { name: "description", type: "string" },
      { name: "voteCount", type: "uint256" },
      { name: "exists", type: "bool" },
    ],
  },
  {
    name: "ElectionCreated",
    type: "event",
    inputs: [
      { name: "electionId", type: "uint256", indexed: true },
      { name: "title", type: "string", indexed: false },
      { name: "startTime", type: "uint256", indexed: false },
      { name: "endTime", type: "uint256", indexed: false },
    ],
  },
  {
    name: "VoteCast",
    type: "event",
    inputs: [
      { name: "electionId", type: "uint256", indexed: true },
      { name: "voter", type: "address", indexed: true },
      { name: "candidateIndex", type: "uint256", indexed: false },
    ],
  },
] as const;