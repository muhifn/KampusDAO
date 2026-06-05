# Deployed Contracts - CampusDAO Sepolia Testnet

Network: Sepolia Testnet (chain ID: 11155111)

## Contract Addresses (Current)

| Contract | Address | Etherscan |
|----------|---------|-----------|
| **CampusSoulboundNFT** | `0xc3975772AC4Dce484C193B8a0D8c17Fa4cf9Bb3a` | [View](https://sepolia.etherscan.io/address/0xc3975772ac4dce484c193b8a0d8c17fa4cf9bb3a) |
| **TimelockController** | `0xA9abef1980dB5F0017231C2f1df8e4A690F5600a` | [View](https://sepolia.etherscan.io/address/0xa9abef1980dB5F0017231C2f1df8e4A690F5600a) |
| **CampusGovernor** | `0x324bD138299f277375926D8E508d4F4072e3fdc4` | [View](https://sepolia.etherscan.io/address/0x324bd138299f277375926d8e508d4f4072e3fdc4) |

## ABI Files (for frontend)

```
out/CampusSoulboundNFT.abi.json  (~32KB ABI for NFT contract)
out/CampusGovernor.abi.json      (~32KB ABI for Governor contract)
```

## How to import in frontend (wagmi/viem)

```typescript
// 1. Import ABIs
import sbtAbi from '../ABI/CampusSoulboundNFT.abi.json';
import governorAbi from '../ABI/CampusGovernor.abi.json';

// 2. Define addresses (Hex format)
const SBT_ADDRESS = '0xc3975772AC4Dce484C193B8a0D8c17Fa4cf9Bb3a' as const;
const GOVERNOR_ADDRESS = '0x324bD138299f277375926D8E508d4F4072e3fdc4' as const;
const TIMELOCK_ADDRESS = '0xA9abef1980dB5F0017231C2f1df8e4A690F5600a' as const;

// 3. Use in wagmi hooks
import { useReadContract, useWriteContract } from 'wagmi';

const { data: hasPass } = useReadContract({
  address: SBT_ADDRESS,
  abi: sbtAbi,
  functionName: 'hasPass',
  args: [userAddress],
});
```

## Key Functions (NFT)

| Function | Access | Args |
|----------|--------|------|
| `claimPass()` | Public (whitelisted) | none |
| `addToWhitelist(address)` | ISSUER_ROLE | student address |
| `revokePass(uint256)` | ISSUER_ROLE | tokenId |
| `burnPass()` | Public (owner) | none |
| `setBaseURI(string)` | ADMIN_ROLE | newBaseURI |
| `hasPass(address)` | Public | student address → bool |
| `isWhitelisted(address)` | Public | student address → bool |
| `locked(uint256)` | Public | tokenId → bool (always true) |

## Key Functions (Governor)

| Function | Access | Args |
|----------|--------|------|
| `propose(...)` | Public (holder) | targets, values, calldatas, description |
| `castVote(uint256, uint8)` | Public (holder) | proposalId, support (0=Against, 1=For, 2=Abstain) |
| `state(uint256)` | Public | proposalId → ProposalState |

## Deployment Info

- Deployer: `0x72667b3CA76FD05146B4bceCE332e98cD5EC4722`
- Network: Sepolia
- Block: <check on explorer>
- Gas used: ~0.202 ETH

## IPFS Metadata

- CID: `bafybeigrwgyqrf52qaeizfyuqsrzuzoyqpmdpe7eghytg5g3dihudr6fo4`
- Base URI: `ipfs://bafybeigrwgyqrf52qaeizfyuqsrzuzoyqpmdpe7eghytg5g3dihudr6fo4/`
- Token URI Example: `ipfs://bafybeigrwgyqrf52qaeizfyuqsrzuzoyqpmdpe7eghytg5g3dihudr6fo4/42.json`
