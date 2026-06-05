# 🏛️ KampusDAO

> Platform **Decentralized Autonomous Organization (DAO)** untuk lingkungan kampus berbasis blockchain — sistem tata kelola yang transparan, terdesentralisasi, dan verifikatif untuk pengambilan keputusan organisasi mahasiswa.

---

## 🎯 Mengapa Proyek Ini Dibuat? (Problem Solving)

Dalam organisasi kampus, seringkali muncul permasalahan berikut:

- **Kecurangan Voting** — Mahasiswa bisa memilih berkali-kali, sulit diverifikasi siapa yang benar-benar sudah vote.
- **Manipulasi Hasil** — Hasil pemilu/pemungutan suara bisa diubah tanpa jejak oleh panitia.
- **Partisipasi Rendah** — Tidak ada mekanisme jelas siapa saja yang berhak dan belum berpartisipasi.
- **Transparansi Nol** — Proses pengambilan keputusan tertutup, mahasiswa tidak bisa meng-audit hasil.
- **Proposal Sulit Diimplementasikan** — Usulan mahasiswa seringkali hanya menjadi wacana tanpa tindak lanjut.

**KampusDAO** menyelesaikan masalah tersebut dengan:

| Masalah | Solusi KampusDAO |
|---------|-------------------|
| Kecurangan voting | **1 mahasiswa = 1 NFT Soulbound** — NFT tidak bisa dipindahtangankan, tidak bisa di duplikasi |
| Manipulasi hasil | **On-chain voting** — Semua vote tercatat immutable di blockchain Sepolia |
| Partisipasi rendah | **Whitelist + Claim System** — Hanya mahasiswa terverifikasi yang bisa vote, jelas siapa yang belum |
| Transparansi | **Semua di blockchain** — Proposal, vote, dan eksekusi bisa di-audit publik lewat Etherscan |
| Proposal tanpa tindak lanjut | **Governor + Timelock** — Proposal yang lolos voting otomatis bisa dieksekusi on-chain |

---

## 🧱 Arsitektur Smart Contract

Proyek ini menggunakan **3 kontrak utama** + **1 kontrak standar OpenZeppelin**:

```
┌─────────────────────────────────────────────────────┐
│                 CampusSoulboundNFT                    │
│          (NFT Pass — Identitas Mahasiswa)             │
│  ERC-721 + ERC-5192 Soulbound + ERC721Votes          │
│  AccessControl (ADMIN_ROLE + ISSUER_ROLE)            │
└──────────┬──────────────────────────┬────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐
│   CampusGovernor     │   │   CampusElection      │
│  (DAO Governance)    │   │  (Pemilu Kampus)      │
│  OpenZeppelin Gov ✓  │   │  Simple on-chain vote │
│  Timelock di bawahnya │   │  dengan kandidat     │
└──────────┬───────────┘   └──────────────────────┘
           │
           ▼
┌──────────────────────┐
│  TimelockController   │
│  (Delay Eksekusi)     │
│  Proposer: Governor   │
│  Delay: 1 hari        │
└──────────────────────┘
```

---

## 📚 Library, EIP, dan ERC yang Digunakan

### Smart Contract (Solidity + Foundry)

| Library / Standar | Digunakan di | Fungsi |
|-------------------|--------------|--------|
| `OpenZeppelin ERC-721` | CampusSoulboundNFT | Standar NFT untuk identitas token |
| `OpenZeppelin ERC721Votes` | CampusSoulboundNFT | Checkpoint voting power — 1 NFT = 1 vote |
| `OpenZeppelin ERC721Enumerable` | CampusSoulboundNFT | Enumerasi token (totalSupply, tokenOfOwnerByIndex) |
| `OpenZeppelin ERC721URIStorage` | CampusSoulboundNFT | Metadata per token (IPFS URI) |
| `OpenZeppelin AccessControl` | CampusSoulboundNFT + CampusElection | Role-based permission (ADMIN_ROLE, ISSUER_ROLE) |
| `OpenZeppelin EIP-712` | CampusSoulboundNFT | Typed structured data signing |
| `OpenZeppelin Governor` | CampusGovernor | Core proposal lifecycle (Propose → Vote → Queue → Execute) |
| `OpenZeppelin GovernorVotes` | CampusGovernor | Voting power source dari token (ERC721Votes) |
| `OpenZeppelin GovernorCountingSimple` | CampusGovernor | Perhitungan suara: For / Against / Abstain |
| `OpenZeppelin GovernorVotesQuorumFraction` | CampusGovernor | Quorum sebagai persentase dari total supply |
| `OpenZeppelin GovernorTimelockControl` | CampusGovernor | Integrasi timelock (delay eksekusi) |
| `OpenZeppelin TimelockController` | Deploy langsung | Menunda eksekusi proposal yang lolos (1 hari) |
| `OpenZeppelin ReentrancyGuard` | CampusElection | Proteksi dari serangan reentrancy |
| `OpenZeppelin Strings` | CampusSoulboundNFT + CampusElection | Utility konversi uint256 → string |
| **EIP-165** | CampusSoulboundNFT | Interface detection via `supportsInterface` |
| **ERC-5192** | CampusSoulboundNFT | Standard Soulbound NFT — melaporkan `locked(tokenId) = true` |
| **ERC-5484** (terinspirasi) | CampusSoulboundNFT | Consent-based minting — mahasiswa harus call `claimPass()` sendiri |
| **ERC-712** | CampusSoulboundNFT | Typed structured data signing untuk meta-transactions |

### Frontend (Next.js + TypeScript)

| Library | Fungsi |
|---------|--------|
| `wagmi` | React hooks untuk interaksi dengan smart contract |
| `viem` | Low-level Ethereum client |
| `@rainbow-me/rainbowkit` | Wallet connection UI (MetaMask, WalletConnect, dll) |
| `@tanstack/react-query` | Server state management & caching |
| `framer-motion` | Animasi UI |
| `react-hot-toast` | Notifikasi toast |
| `ioredis` | Redis client untuk whitelist request storage |
| `@phosphor-icons/react` | Ikon UI |

### Tooling

| Tool | Konfigurasi |
|------|-------------|
| **Foundry** | Solidity compiler `0.8.28`, EVM Cancun, optimizer 200 runs |
| **Next.js 16** | Frontend framework |
| **Tailwind CSS v4** | Utility-first styling |
| **PostCSS** | CSS post-processing |

---

## ⚙️ Cara Kerja Smart Contract

### 1. CampusSoulboundNFT — NFT Pass Mahasiswa

```
ADMIN ──► addToWhitelist(mahasiswa)  →  mahasiswa di-whitelist
                                         ↓
MAHASISWA ──► claimPass()             →  NFT di-mint otomatis
                                         │
                                         ├─ Auto-delegate voting power ke pemilik
                                         ├─ Locked(tokenId) = true (Soulbound)
                                         ├─ Event: PassClaimed(student, tokenId)
                                         └─ Event: Locked(tokenId)
                                    
  ❌ Tidak bisa transfer (SoulboundTransferNotAllowed)
  ❌ Tidak bisa approve / setApprovalForAll
  ❌ 1 alamat hanya bisa punya 1 NFT
  ✅ Bisa burn sendiri (burnPass)
  ✅ Admin bisa revoke (revokePass)
```

**Fitur Utama:**
- **Soulbound (Non-Transferable)**: Override `_update()` memblokir semua transfer — hanya mengizinkan mint (`from == address(0)`) dan burn (`to == address(0)`)
- **Consent Mint**: Mahasiswa harus secara sadar memanggil `claimPass()` — bukan airdrop
- **Auto-Delegate**: Begitu claim, `_delegate(to, to)` dipanggil agar voting power langsung aktif
- **1 Pass per Address**: Mapping `_passBook` memastikan hanya 1 NFT per mahasiswa
- **Role-based**: `ISSUER_ROLE` untuk whitelist, `ADMIN_ROLE` untuk set metadata

### 2. CampusGovernor — DAO Governance

```
MAHASISWA ──► propose(targets, values, calldatas, description)
                   │
                   ▼
              Proposal State: Pending
                   │
         ┌── Voting Delay (1 block) ──┐
                   │
                   ▼
              Proposal State: Active (voting period ~300 blocks / 1 jam)
                   │
         ┌─ castVote(id, 0=Against / 1=For / 2=Abstain) ──┐
                   │
                   ▼
         ┌── Quorum 15% tercapai? ──┐
         │  YA → Succeeded           │
         │  TIDAK → Defeated         │
         └───────────────────────────┘
                   │ (jika Succeeded)
                   ▼
              Queue ke TimelockController (delay 1 hari)
                   │
                   ▼
              Execute — transaksi on-chain dijalankan
```

**Parameter Konfigurasi:**

| Parameter | Nilai Development | Nilai Production (terdefinisi) |
|-----------|-------------------|-------------------------------|
| Voting Delay | 1 block (~12 detik) | 1 hari |
| Voting Period | 300 block (~1 jam) | 5 hari |
| Quorum | 15% | 15% |
| Proposal Threshold | 1 NFT | 1 NFT |
| Timelock Delay | 1 hari | 1 hari |

**Daul *voting delay & period singkat* digunakan untuk keperluan demo/hackathon. Di production bisa diubah sesuai konstanta yang terdefinisi (`VOTING_DELAY_SEC = 1 days`, `VOTING_PERIOD_SEC = 5 days`).**

**Fungsi Voting yang Di-override:**
- `propose()` — Gate: `hasPass(msg.sender)` wajib punya Campus Pass
- `castVote()` — Gate: `hasPass(msg.sender)` wajib punya Campus Pass
- `castVoteWithReason()` — Sama + alasan vote
- `castVoteWithReasonAndParams()` — Sama + params tambahan
- `castVoteBySig()` — Vote via signature (gasless), tetap validasi pass voter
- `castVoteWithReasonAndParamsBySig()` — Kombinasi signature + reason + params

### 3. CampusElection — Pemilu Kampus

```
ADMIN ──► createElection(title, desc, startTime, endTime)
                   │
                   ▼
ADMIN ──► addCandidate(electionId, "Nama Kandidat", "Deskripsi")
                   │
                   ▼ (election startTime tercapai)
MAHASISWA ──► vote(electionId, candidateIndex)
                   │
                   ├─ Validasi: punya Campus Pass? belum vote? election aktif?
                   └─ 1 mahasiswa = 1 suara per election
                   │
                   ▼ (election berakhir)
               getResults(electionId) → [nama[], votes[]]
```

**Fitur Utama:**
- `vote()` dilindungi `nonReentrant` (anti serangan reentrancy)
- 1 mahasiswa hanya bisa vote 1 kali per election (`hasVoted` mapping)
- Kandidat harus ditambahkan sebelum election dimulai (tidak bisa saat aktif)
- Hasil bisa dibaca siapa saja via `getResults()`

### 4. TimelockController

Kontrak standar OpenZeppelin yang digunakan langsung (bukan kontrak kustom):
- **Min Delay**: 1 hari (86.400 detik)
- **Proposer**: CampusGovernor
- **Executor**: Siapa saja (`address(0)`)
- **Fungsi**: Semua proposal yang lolos voting harus menunggu 1 hari sebelum bisa dieksekusi — memberi waktu bagi anggota DAO untuk keluar jika tidak setuju dengan keputusan.

---

## 📝 Form Pengajuan Proposal — Bagian "On-chain Actions"

Saat membuat proposal di halaman **Create Proposal** (`/proposals/create`), terdapat bagian opsional bernama **"On-chain Actions"**. Bagian ini dapat diisi oleh pengguna untuk menentukan transaksi on-chain apa yang akan dieksekusi jika proposal disetujui.

### Field yang Bisa Diisi:

| Field | Deskripsi | Format / Contoh |
|-------|-----------|-----------------|
| **Target address** | Alamat smart contract yang akan dipanggil | `0x1234...` (address valid di Sepolia) |
| **Value (wei)** | Jumlah ETH yang akan dikirim ke target | `0` (untuk function call biasa), `1000000000000000000` (untuk 1 ETH) |
| **Calldata** | Data encoding pemanggilan fungsi (function signature + parameter) | `0xa9059cbb...` (transfer ERC-20) |

### Contoh Use Case On-chain Actions:

#### 1. Proposal Pendanaan — Kirim ETH ke Akun
```
Target: 0xRecipientAddress
Value:  1000000000000000000 (1 ETH)
Calldata: 0x
```

#### 2. Proposal Transfer Token ERC-20 dari Treasury DAO
```
Target: 0xTokenContractAddress
Value:  0
Calldata: 0xa9059cbb + padded_recipient + padded_amount
```

#### 3. Proposal Ubah Parameter Kontrak
```
Target: 0xContractAddress
Value:  0
Calldata: 0xfunctionSelector + params_encoded
```

#### 4. Proposal Tanpa On-chain Action (Signal Proposal)
```
Tidak perlu isi apa pun — biarkan kosong.
Secara otomatis system akan membuat proposal dengan target address(0) dan calldata "0x".
Ini adalah proposal sinyal (signal proposal) — hanya untuk pengambilan keputusan tanpa eksekusi on-chain.
```

### Bagaimana Calldata Dibuat?

Calldata adalah encoding ABI dari pemanggilan fungsi. Formatnya:
```
0x + 4 bytes function selector + 32 bytes per parameter (padded)
```

Contoh: Untuk memanggil `transfer(address,uint256)`:
```
Function selector: bytes4(keccak256("transfer(address,uint256)")) = 0xa9059cbb
Parameter 1 (address): 0x000000000000000000000000<recipient-address>
Parameter 2 (uint256): 0x0000000000000000000000000000000000000000000000000000000000000064 (100)
```

Calldata bisa digenerate menggunakan tools seperti `ethers.js`, `viem`, atau web3 frontend helper.

---

## 🚀 Deployment (Sepolia Testnet)

| Kontrak | Address | Etherscan |
|---------|---------|-----------|
| **CampusSoulboundNFT** | `0x9Fa19CD9D9a8c8CFE7030384aE42bF3E2b58b10F` | [View](https://sepolia.etherscan.io/address/0x9Fa19CD9D9a8c8CFE7030384aE42bF3E2b58b10F) |
| **TimelockController** | `0x64F3F2c186B0F78f0Ddf39d615d7b8cE7915761D` | [View](https://sepolia.etherscan.io/address/0x64F3F2c186B0F78f0Ddf39d615d7b8cE7915761D) |
| **CampusGovernor** | `0xB04a8f7D499CA8DeE37B0DA005D09B499C52Cc45` | [View](https://sepolia.etherscan.io/address/0xB04a8f7D499CA8DeE37B0DA005D09B499C52Cc45) |
| **CampusElection** | `0x23Bf27D39748bB77A4fbbD9740B1FEE067081E97` | [View](https://sepolia.etherscan.io/address/0x23Bf27D39748bB77A4fbbD9740B1FEE067081E97) |

**Metadata IPFS:**
- CID: `bafybeigrwgyqrf52qaeizfyuqsrzuzoyqpmdpe7eghytg5g3dihudr6fo4`
- Base URI: `ipfs://bafybeigrwgyqrf52qaeizfyuqsrzuzoyqpmdpe7eghytg5g3dihudr6fo4/`

---

## 📁 Struktur Proyek

```
Project-Ifest/
├── smart-contracts/           # Foundry project
│   ├── src/
│   │   ├── CampusGovernor.sol
│   │   ├── CampusElection.sol
│   │   └── CampusSoulboundNFT.sol
│   ├── script/
│   │   ├── Deploy.s.sol
│   │   ├── DeployElection.s.sol
│   │   └── DeployFix.s.sol
│   ├── test/
│   │   ├── CampusGovernor.t.sol
│   │   └── CampusSoulboundNFT.t.sol
│   └── foundry.toml
├── frontend-connection/       # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── dao/           # DAO Dashboard
│       │   ├── proposals/     # Proposal list, detail, create
│       │   ├── elections/     # Election list & voting
│       │   ├── profile/       # User profile & NFT badge
│       │   └── admin/         # Admin whitelist & elections
│       ├── components/
│       ├── hooks/
│       └── lib/
└── DEPLOYED_CONTRACTS.md
```

---

## 🔧 Development Commands

```bash
# Smart Contracts (Foundry)
cd smart-contracts
forge build
forge test
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast

# Frontend (Next.js)
cd frontend-connection
pnpm dev
pnpm build
pnpm lint
```