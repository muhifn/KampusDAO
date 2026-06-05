# 🏛️ Campus DAO — Implementation Plan

Membangun sistem DAO untuk kampus dengan NFT Pass Soulbound, on-chain voting, dan Account Abstraction (wallet recovery) di **Sepolia Testnet**.

---

## Resolved Questions

### 1. 🏷️ Nama DAO & NFT — Saran

| Nama DAO | Nama NFT | Ticker | Vibe |
|----------|----------|--------|------|
| **CivitasDAO** | Civitas Pass | CIVIT | Formal, akademis (Civitas Academica) |
| **KampusDAO** | Kampus Pass | KDAO | Simpel, jelas, lokal |
| **UniGov** | UniGov Pass | UGOV | Modern, governance-focused |
| **StudiDAO** | Studi Pass | SDAO | Ringan, friendly |
| **AgoraDAO** | Agora Pass | AGORA | Klasik (Agora = tempat diskusi Yunani) |

> [!TIP]
> **Rekomendasi**: **CivitasDAO** — "Civitas Academica" berarti komunitas akademik, cocok untuk lingkungan kampus. Atau **KampusDAO** jika ingin straightforward.

### 2. 🎫 Minting Flow — Best Practice Analysis

| Metode | Cara Kerja | Pro | Kontra |
|--------|------------|-----|--------|
| **⭐ Whitelist + Student Claim** | Admin whitelist → Mahasiswa call `claimPass()` | Consent mechanism (sesuai ERC-5484), mahasiswa aktif terlibat, gas bisa di-sponsor Paymaster | Perlu 2 langkah |
| Admin Direct Mint | Admin call `mintTo(student)` | Simpel, 1 langkah | Tidak ada consent, admin bayar gas semua, mahasiswa bisa dapat NFT tanpa sadar |

> [!IMPORTANT]
> **Best Practice: Whitelist + Student Claim.** Alasan:
> - ✅ **Consent** — Mahasiswa secara sadar setuju menerima NFT (penting untuk SBT/Soulbound)
> - ✅ **Gas Sponsored** — Dengan Alchemy Paymaster, mahasiswa tidak perlu bayar gas
> - ✅ **Engagement** — Mahasiswa harus login & interact, memastikan wallet mereka aktif
> - ✅ **Auditability** — Jelas siapa yang claim kapan (event log)
> - ✅ **Auto-delegate** — Saat claim, voting power langsung aktif

**Flow yang diimplementasi:**
```
Admin → addToWhitelist(studentAddress)
Mahasiswa → claimPass()  // Hanya bisa jika di-whitelist & belum punya NFT
  → NFT minted + auto-delegate voting power
  → Event: Locked(tokenId) + PassClaimed(student, tokenId)
```

### 3. ✅ Revoke NFT — Confirmed

Admin (ISSUER_ROLE) bisa revoke/burn NFT mahasiswa:
- Mahasiswa lulus → revoke
- Mahasiswa DO → revoke
- Mahasiswa bisa burn sendiri (voluntary)

### 4. 🗳️ Tipe Voting — DAO Governance Umum

Menggunakan OpenZeppelin Governor standard yang mendukung **semua jenis proposal**:
- Pemilihan ketua organisasi
- Proposal pendanaan
- Perubahan aturan/kebijakan
- Apapun yang bisa diajukan sebagai proposal

### 5. 📁 Project Directory — Ditunda

Akan ditentukan saat mulai development.

---

## User Review Required

> [!IMPORTANT]
> **Pilih nama DAO & NFT** dari saran di atas, atau usulkan nama Anda sendiri.

> [!NOTE]
> **Single Wallet Strategy (Alchemy Account Kit Only)**: Proyek ini menggunakan **Alchemy Account Kit** sebagai satu-satunya wallet provider:
> 1. **Login via Email / Social / Passkey** — otomatis create Smart Wallet (untuk mahasiswa tanpa wallet)
> 2. **Login via MetaMask / Existing Wallet** — EOA di-wrap sebagai signer untuk Smart Wallet
>
> Kedua metode menghasilkan Smart Wallet yang sama, dengan guardian-based recovery dan gas sponsorship untuk semua mahasiswa. RainbowKit tidak digunakan.

---

## Proposed Changes

Proyek dibagi menjadi **4 Fase** yang dikerjakan berurutan:

---

### Fase 1: Setup & Infrastructure

#### [NEW] `contracts/` — Hardhat Project

Setup Hardhat project untuk smart contract development.

```bash
mkdir contracts && cd contracts
pnpm init
pnpm add -D hardhat @nomicfoundation/hardhat-toolbox typescript ts-node
pnpm add @openzeppelin/contracts
npx hardhat init  # TypeScript project
```

#### [NEW] `contracts/hardhat.config.ts`
- Konfigurasi Sepolia network
- Etherscan verification
- Solidity compiler ^0.8.20

#### [NEW] `contracts/.env`
- `SEPOLIA_RPC_URL` — Alchemy Sepolia endpoint
- `PRIVATE_KEY` — deployer wallet
- `ETHERSCAN_API_KEY` — contract verification

---

### Fase 2: Smart Contract Development

3 kontrak utama yang harus di-develop:

---

#### [NEW] `contracts/contracts/CampusSoulboundNFT.sol`

**NFT Pass Soulbound** — Kontrak utama untuk identitas mahasiswa.

**Inherits:**
- `ERC721` — Base NFT
- `ERC721Votes` — Voting power (1 NFT = 1 vote)
- `ERC721URIStorage` — Metadata per token
- `ERC721Enumerable` — Enumeration support
- `AccessControl` — Role-based permissions
- `EIP712` — Typed data signing

**Fitur yang diimplementasi:**

| Fitur | Standard | Detail |
|-------|----------|--------|
| Non-Transferable | ERC-5192 | Override `_update()` — block semua transfer, hanya allow mint & burn |
| Voting Power | ERC721Votes | 1 NFT = 1 vote, timestamp-based clock |
| Consent Mint | Inspirasi ERC-5484 | Mahasiswa harus call `claimPass()` sendiri (bukan airdrop) |
| Burn Authorization | Inspirasi ERC-5484 | `BurnAuth` enum: admin bisa revoke, mahasiswa bisa burn |
| Auto-Delegate | Custom | `_delegate(to, to)` otomatis saat mint |
| 1 Pass per Address | Custom | Setiap address hanya boleh punya 1 NFT |
| Roles | AccessControl | `ADMIN_ROLE` (deploy admin), `ISSUER_ROLE` (kampus/admin yang bisa whitelist) |

---

### 🚨 SBT Ownership Verification & Error Handling (Mentor's Requirement)

> [!IMPORTANT]
> **Bagaimana cara tau NFT SBT itu dia punya, dan berikan error ketika tidak bisa di-transfer atau error lainnya?**

#### A. Cara Verifikasi Kepemilikan SBT (On-Chain)

```solidity
// ========== FUNCTIONS UNTUK CEK KEPEMILIKAN ==========

// 1. Cek apakah address punya SBT (return jumlah token)
function balanceOf(address owner) public view returns (uint256);
// Contoh: balanceOf(0x123...) => 1 (punya) atau 0 (tidak punya)

// 2. Cek siapa pemilik token tertentu
function ownerOf(uint256 tokenId) public view returns (address);
// Contoh: ownerOf(1) => 0x123... (pemilik token #1)

// 3. Cek apakah token terkunci (Soulbound) - ERC-5192
function locked(uint256 tokenId) external pure returns (bool);
// SELALU return true — karena semua token adalah Soulbound

// 4. Custom: Cek apakah address sudah punya pass
function hasPass(address student) external view returns (bool);
// Return true jika balanceOf(student) > 0

// 5. Custom: Cek apakah address di-whitelist
function isWhitelisted(address student) external view returns (bool);
```

#### B. Custom Errors (Solidity ^0.8.20)

Semua error menggunakan **custom errors** (lebih gas-efficient dari `require` string):

```solidity
// ========== CUSTOM ERRORS ==========

/// @notice Token tidak bisa ditransfer karena Soulbound
error SoulboundTransferNotAllowed();
// Kapan: transferFrom(), safeTransferFrom() — SELALU revert

/// @notice Address sudah punya NFT Pass
error AlreadyHasPass(address student);
// Kapan: claimPass() ketika sudah punya 1 NFT

/// @notice Address belum di-whitelist oleh admin
error NotWhitelisted(address student);
// Kapan: claimPass() ketika belum di-whitelist

/// @notice Token tidak ada (belum dimint atau sudah di-burn)
error TokenDoesNotExist(uint256 tokenId);
// Kapan: locked(), tokenURI() dengan tokenId yang tidak valid

/// @notice Hanya pemilik token yang bisa burn
error NotTokenOwner(address caller, uint256 tokenId);
// Kapan: burnPass() oleh bukan pemilik

/// @notice Address sudah ada di whitelist
error AlreadyWhitelisted(address student);
// Kapan: addToWhitelist() ketika sudah terdaftar

/// @notice Address tidak ada di whitelist
error NotInWhitelist(address student);
// Kapan: removeFromWhitelist() ketika tidak terdaftar
```

#### C. Implementasi `_update()` — Blokir Transfer

```solidity
/// @notice Override _update untuk memblokir semua transfer (Soulbound)
/// @dev Hanya mengizinkan mint (from == 0) dan burn (to == 0)
function _update(address to, uint256 tokenId, address auth)
    internal override(ERC721, ERC721Votes, ERC721Enumerable)
    returns (address)
{
    address from = _ownerOf(tokenId);
    
    // BLOKIR TRANSFER: from != 0 (bukan mint) DAN to != 0 (bukan burn)
    if (from != address(0) && to != address(0)) {
        revert SoulboundTransferNotAllowed();
        // Error ini akan muncul di:
        // - MetaMask: "execution reverted: SoulboundTransferNotAllowed()"
        // - Etherscan: "Fail with error 'SoulboundTransferNotAllowed()'"
        // - Frontend: bisa di-catch dan tampilkan pesan user-friendly
    }
    
    return super._update(to, tokenId, auth);
}
```

#### D. Frontend Error Handling

```typescript
// ========== FRONTEND: Cara Cek Kepemilikan SBT ==========
import { useReadContract, useAccount } from 'wagmi';
import { sbtAbi, sbtAddress } from '@/lib/contracts';

// 1. Cek apakah user punya SBT
function useHasPass() {
  const { address } = useAccount();
  return useReadContract({
    address: sbtAddress,
    abi: sbtAbi,
    functionName: 'hasPass',
    args: [address!],
    enabled: !!address,
  });
}

// 2. Cek apakah token locked (Soulbound)
function useIsLocked(tokenId: bigint) {
  return useReadContract({
    address: sbtAddress,
    abi: sbtAbi,
    functionName: 'locked',
    args: [tokenId],
  });
}

// 3. Handle error saat mencoba transfer
function TransferButton({ tokenId }: { tokenId: bigint }) {
  // Ini akan SELALU gagal karena Soulbound!
  const { writeContract, error } = useWriteContract();
  
  const handleTransfer = async () => {
    try {
      await writeContract({
        address: sbtAddress,
        abi: sbtAbi,
        functionName: 'transferFrom',
        args: [fromAddress, toAddress, tokenId],
      });
    } catch (err) {
      if (err.message.includes('SoulboundTransferNotAllowed')) {
        // Tampilkan pesan: "NFT ini adalah Soulbound dan tidak bisa dipindahkan"
        toast.error('NFT ini adalah Soulbound Token dan tidak bisa ditransfer!');
      } else if (err.message.includes('AlreadyHasPass')) {
        toast.error('Anda sudah memiliki Campus Pass!');
      } else if (err.message.includes('NotWhitelisted')) {
        toast.error('Anda belum terdaftar. Hubungi admin kampus.');
      }
    }
  };
}

// 4. NFT Gate — Proteksi halaman DAO
function DAOGate({ children }: { children: React.ReactNode }) {
  const { data: hasPass, isLoading } = useHasPass();
  
  if (isLoading) return <Loading />;
  if (!hasPass) {
    return (
      <div className="text-center p-8">
        <h2>⛔ Akses Ditolak</h2>
        <p>Anda memerlukan Campus Pass NFT untuk mengakses DAO.</p>
        <p>Hubungi admin kampus untuk mendapatkan whitelist.</p>
        <ClaimPassButton /> {/* Jika sudah whitelisted */}
      </div>
    );
  }
  
  return children; // Akses diberikan
}
```

#### E. Etherscan / Block Explorer Visibility

Ketika seseorang mencoba transfer SBT di Etherscan:
```
Status: Fail ❌
Error: SoulboundTransferNotAllowed()
Gas Used: ~23,000 (minimal, karena revert di awal)
```

Ketika berhasil mint:
```
Status: Success ✅
Events:
  - Transfer(from: 0x0, to: 0x123..., tokenId: 1)  // ERC-721 mint
  - Locked(tokenId: 1)                               // ERC-5192 locked
  - PassClaimed(student: 0x123..., tokenId: 1)       // Custom event
```

#### F. ERC-5192 Detection (EIP-165)

Wallet dan dApp bisa **otomatis mendeteksi** apakah sebuah NFT adalah Soulbound:

```solidity
// Smart contract side
function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
    return interfaceId == 0xb45a3c0e || // IERC5192 (Soulbound)
           super.supportsInterface(interfaceId);
}
```

```typescript
// Frontend side: detect if NFT is Soulbound
const isSoulbound = await publicClient.readContract({
  address: nftAddress,
  abi: parseAbi(['function supportsInterface(bytes4) view returns (bool)']),
  functionName: 'supportsInterface',
  args: ['0xb45a3c0e'], // IERC5192 interface ID
});
// isSoulbound === true → NFT ini Soulbound!
```

---

**Key Functions:**
```solidity
// Admin functions
function addToWhitelist(address student) external onlyRole(ISSUER_ROLE);
function removeFromWhitelist(address student) external onlyRole(ISSUER_ROLE);
function revokePass(uint256 tokenId) external onlyRole(ISSUER_ROLE);

// Student functions  
function claimPass() external;  // Mahasiswa claim sendiri (consent)
function burnPass(uint256 tokenId) external; // Mahasiswa burn sendiri

// View functions
function hasPass(address student) external view returns (bool);
function isWhitelisted(address student) external view returns (bool);
function locked(uint256 tokenId) external pure returns (bool); // ERC-5192
```

---

#### [NEW] `contracts/contracts/CampusGovernor.sol`

**DAO Governor** — Kontrak governance untuk voting.

**Inherits:**
- `Governor` — Core proposal lifecycle
- `GovernorVotes` — Voting power dari CampusSoulboundNFT
- `GovernorCountingSimple` — For / Against / Abstain
- `GovernorVotesQuorumFraction` — Quorum sebagai % total supply
- `GovernorTimelockControl` — Integrasi timelock

**Parameter Konfigurasi:**

| Parameter | Nilai | Keterangan |
|-----------|-------|------------|
| Voting Delay | 1 hari (86400 detik) | Waktu persiapan |
| Voting Period | 5 hari (432000 detik) | Durasi voting |
| Quorum | 15% | % minimum partisipasi |
| Proposal Threshold | 1 | Minimal 1 NFT untuk propose |

**Key Functions:**
```solidity
function propose(...) // Ajukan proposal baru
function castVote(uint256 proposalId, uint8 support) // Vote
function castVoteWithReason(uint256 proposalId, uint8 support, string reason)
function queue(...) // Queue ke timelock setelah voting berhasil
function execute(...) // Eksekusi setelah timelock delay
```

---

#### [NEW] `contracts/contracts/TimelockController.sol`

Menggunakan langsung `TimelockController` dari OpenZeppelin — **tidak perlu custom kontrak**.

**Parameter:**
- `minDelay`: 1 hari (86400 detik)
- `proposers`: [CampusGovernor address]
- `executors`: [address(0)] — siapa saja bisa execute
- `admin`: deployer (akan di-renounce setelah setup)

---

#### [NEW] `contracts/test/CampusSoulboundNFT.test.ts`

Unit test untuk NFT:
- ✅ Mint via whitelist + claim
- ✅ Block transfer (soulbound)
- ✅ Block double mint (1 per address)
- ✅ Burn authorization (admin revoke, self burn)
- ✅ Voting power active after mint (auto-delegate)
- ✅ ERC-5192 `locked()` returns true
- ✅ Access control (only ISSUER_ROLE can whitelist)

#### [NEW] `contracts/test/CampusGovernor.test.ts`

Unit test untuk Governor:
- ✅ Create proposal
- ✅ Vote (for, against, abstain)
- ✅ Quorum check
- ✅ Queue + execute via timelock
- ✅ Proposal threshold (need NFT to propose)
- ✅ Cannot vote without NFT

#### [NEW] `contracts/scripts/deploy.ts`

Deployment script ke Sepolia:
1. Deploy `CampusSoulboundNFT`
2. Deploy `TimelockController`
3. Deploy `CampusGovernor` (pointing to NFT + Timelock)
4. Setup roles pada TimelockController
5. Verify all contracts on Etherscan Sepolia
6. Log semua contract addresses

---

### Fase 3: Frontend Development

Build di atas project Next.js yang sudah ada atau project baru.

---

#### [NEW/MODIFY] Frontend Dependencies

```bash
# Alchemy Account Kit (single wallet provider)
pnpm add @account-kit/core @account-kit/react @account-kit/infra @account-kit/smart-contracts

# Web3 Core
pnpm add wagmi viem@2.x @tanstack/react-query

# Utilities
pnpm add react-hot-toast   # Notifications
```

---

#### [NEW] `src/lib/alchemy.ts` — Alchemy Account Kit Config (Single Wallet)

```typescript
import { createConfig, cookieStorage } from "@account-kit/react";
import { sepolia, alchemy } from "@account-kit/infra";

export const alchemyConfig = () => createConfig({
  transport: alchemy({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY! }),
  chain: sepolia,
  ssr: true,
  storage: cookieStorage,
  chains: [{
    chain: sepolia,
    policyId: process.env.NEXT_PUBLIC_ALCHEMY_POLICY_ID,
  }],
});
```

#### [NEW] `src/lib/contracts.ts` — Contract Addresses & ABIs

Menyimpan semua deployed contract addresses dan import ABIs.

---

#### [NEW] `src/components/providers/Web3Provider.tsx`

Provider wrapper dengan:
- `WagmiProvider` (Wagmi config)
- `QueryClientProvider` (TanStack Query)
- Alchemy Account Kit Provider (single wallet: EOA + Smart Wallet)

---

#### [NEW] `src/app/layout.tsx`

Root layout dengan Web3Provider wrapper.

#### [NEW] `src/app/page.tsx` — Landing Page

- Hero section dengan branding DAO kampus
- Connect wallet button (Alchemy Account Kit: email/passkey/MetaMask)
- Status NFT Pass (punya / belum punya)
- Quick stats: total members, active proposals

#### [NEW] `src/app/dao/page.tsx` — DAO Dashboard

- Overview: active proposals, recent votes
- Member stats
- Quick actions: create proposal, view NFT

#### [NEW] `src/app/proposals/page.tsx` — Proposal List

- List semua proposals (active, pending, succeeded, defeated, executed)
- Filter & search
- Create proposal button

#### [NEW] `src/app/proposals/[id]/page.tsx` — Proposal Detail

- Proposal info (title, description, proposer)
- Voting status (For/Against/Abstain bars)
- Vote buttons
- Execution status
- Timeline

#### [NEW] `src/app/profile/page.tsx` — User Profile

- NFT Pass display (badge)
- Voting history
- Delegation status
- Claim/mint NFT Pass (jika belum punya & whitelisted)

#### [NEW] `src/app/recovery/page.tsx` — Wallet Recovery

- Guardian management
- Recovery initiation
- Recovery status

---

#### [NEW] Component Files

| Component | Lokasi | Fungsi |
|-----------|--------|--------|
| `ProposalCard.tsx` | `components/dao/` | Card untuk menampilkan proposal di list |
| `VoteButton.tsx` | `components/dao/` | Button voting (For/Against/Abstain) |
| `ProposalForm.tsx` | `components/dao/` | Form buat proposal baru |
| `NFTBadge.tsx` | `components/nft/` | Display NFT Pass badge |
| `MintButton.tsx` | `components/nft/` | Claim/mint NFT Pass |
| `ConnectButton.tsx` | `components/wallet/` | Login via Account Kit (email/passkey/MetaMask) |

---

#### [NEW] Custom Hooks

| Hook | Lokasi | Fungsi |
|------|--------|--------|
| `useGovernor.ts` | `hooks/` | Propose, vote, queue, execute, read proposals |
| `useSoulboundNFT.ts` | `hooks/` | Mint, check ownership, check whitelist |
| `useSmartAccount.ts` | `hooks/` | Alchemy smart account operations |

---

### Fase 4: Integration & Deploy

#### Deploy ke Sepolia
1. Deploy smart contracts via Hardhat
2. Verify contracts on Etherscan Sepolia
3. Update contract addresses di frontend
4. Setup Alchemy Gas Manager policy
5. Test end-to-end flow

#### End-to-End Test Flow
1. Admin whitelist mahasiswa address
2. Mahasiswa connect wallet via Alchemy Account Kit (email/passkey atau MetaMask)
3. Mahasiswa claim NFT Pass → auto-delegate voting power
4. Mahasiswa buat proposal
5. Mahasiswa lain vote
6. Proposal queue + execute via timelock

---

## Verification Plan

### Automated Tests

```bash
# Smart contract tests
cd contracts
npx hardhat test
npx hardhat coverage

# Contract deployment to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Frontend dev server
cd frontend
pnpm dev
```

### Manual Verification

1. **Soulbound Test**: Coba transfer NFT setelah mint → harus revert
2. **Double Mint Test**: Coba mint 2x ke address sama → harus revert
3. **Voting Test**: Buat proposal, vote, queue, execute → full lifecycle
4. **Smart Wallet Test**: Login via email → claim NFT → vote → pastikan gas-free
5. **Recovery Test**: Setup guardian → initiate recovery → verify ownership change
6. **Etherscan Sepolia**: Verify semua contract source code terupload

### Browser Testing
- MetaMask wallet connection (via Account Kit signer)
- Smart wallet login (email/passkey)
- NFT claim flow
- Proposal creation & voting
- Mobile responsive check
