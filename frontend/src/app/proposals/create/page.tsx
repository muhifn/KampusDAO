"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { CONTRACTS, governorAbi, sbtAbi } from "@/lib/contracts";
import {
  ArrowLeft,
  CircleNotch,
  CheckCircle,
  Warning,
  Plus,
  Trash,
} from "@phosphor-icons/react";
import Link from "next/link";

interface ProposalAction {
  target: string;
  value: string;
  calldata: string;
}

export default function CreateProposalPage() {
  const { address, isConnected } = useAccount();

  const { data: hasPass, isLoading: isCheckingPass } = useReadContract({
    address: CONTRACTS.CampusSoulboundNFT,
    abi: sbtAbi,
    functionName: "hasPass",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [actions, setActions] = useState<ProposalAction[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addAction = () => {
    setActions([...actions, { target: "", value: "0", calldata: "0x" }]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, field: keyof ProposalAction, value: string) => {
    const updated = [...actions];
    updated[index][field] = value;
    setActions(updated);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSuccess(false);
      setTxHash(null);

      const targets = actions.length > 0
        ? actions.map((a) => a.target as `0x${string}`)
        : ["0x0000000000000000000000000000000000000000" as `0x${string}`];
      const values = actions.length > 0
        ? actions.map((a) => BigInt(a.value || "0"))
        : [BigInt(0)];
      const calldatas = actions.length > 0
        ? actions.map((a) => (a.calldata || "0x") as `0x${string}`)
        : ["0x" as `0x${string}`];
      const fullDescription = `# ${title}\n\n${description}`;

      const hash = await writeContractAsync({
        address: CONTRACTS.CampusGovernor,
        abi: governorAbi,
        functionName: "propose",
        args: [targets, values, calldatas, fullDescription],
        gas: BigInt(300_000),
      });

      setTxHash(hash);
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create proposal");
    }
  };

  if (!isConnected) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12 md:py-24">
        <div className="flex flex-col items-center justify-center rounded-xl bg-stone-900 border border-stone-800 p-12">
          <Warning size={48} className="text-stone-500 mb-4" />
          <h3 className="text-lg font-semibold text-stone-100 mb-2">
            Connect your wallet
          </h3>
          <p className="text-stone-500 text-center">
            Connect your wallet to create a proposal.
          </p>
        </div>
      </main>
    );
  }

  if (isCheckingPass) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12 md:py-24">
        <div className="flex flex-col items-center justify-center rounded-xl bg-stone-900 border border-stone-800 p-12">
          <CircleNotch size={48} className="text-stone-500 animate-spin mb-4" />
          <p className="text-stone-500">Checking your Campus Pass...</p>
        </div>
      </main>
    );
  }

  if (!hasPass) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12 md:py-24">
        <Link
          href="/proposals"
          className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-200 mb-8"
        >
          <ArrowLeft size={16} />
          Back to Proposals
        </Link>
        <div className="flex flex-col items-center justify-center rounded-xl bg-stone-900 border border-stone-800 p-12">
          <Warning size={48} className="text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-stone-100 mb-2">
            Campus Pass Required
          </h3>
          <p className="text-stone-500 text-center mb-4">
            You need a Campus Pass (NFT) to create proposals. Claim your pass
            from the DAO page first.
          </p>
          <Link
            href="/dao"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-400"
          >
            Go to DAO
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/proposals"
        className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-200 mb-8"
      >
        <ArrowLeft size={16} />
        Back to Proposals
      </Link>

      <h1 className="text-3xl font-bold tracking-tight text-stone-100 mb-2">
        Create Proposal
      </h1>
      <p className="text-stone-400 mb-8">
        Submit a new governance proposal for the DAO to vote on.
      </p>

      {isSuccess ? (
        <div className="rounded-xl bg-stone-900 border border-stone-800 p-8">
          <div className="flex flex-col items-center text-center">
            <CheckCircle size={48} className="text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-stone-100 mb-2">
              Proposal Created!
            </h3>
            <p className="text-stone-500 mb-4">
              Your proposal has been submitted to the DAO.
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 underline text-sm"
            >
              View transaction on Etherscan
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Title */}
          <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Fund new campus study rooms"
              className="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-3 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            />
          </div>

          {/* Description */}
          <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your proposal in detail..."
              rows={8}
              className="w-full rounded-lg bg-stone-800 border border-stone-700 px-4 py-3 text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 resize-y"
            />
          </div>

          {/* On-chain Actions (optional) */}
          <div className="rounded-xl bg-stone-900 border border-stone-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-stone-300">
                  On-chain Actions
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Optional. Add contract calls to execute if the proposal passes.
                </p>
              </div>
              <button
                type="button"
                onClick={addAction}
                className="inline-flex items-center gap-1 rounded-lg bg-stone-800 border border-stone-700 px-3 py-1.5 text-xs font-medium text-stone-300 hover:bg-stone-700"
              >
                <Plus size={14} />
                Add Action
              </button>
            </div>

            {actions.length === 0 && (
              <p className="text-sm text-stone-600 text-center py-4">
                No on-chain actions. This will create a signal proposal.
              </p>
            )}

            {actions.map((action, index) => (
              <div
                key={index}
                className="mb-4 rounded-lg border border-stone-800 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-stone-400">
                    Action {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAction(index)}
                    className="text-stone-500 hover:text-red-400"
                  >
                    <Trash size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={action.target}
                  onChange={(e) => updateAction(index, "target", e.target.value)}
                  placeholder="Target address (0x...)"
                  className="w-full rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={action.value}
                    onChange={(e) => updateAction(index, "value", e.target.value)}
                    placeholder="Value (wei)"
                    className="w-32 rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                  <input
                    type="text"
                    value={action.calldata}
                    onChange={(e) => updateAction(index, "calldata", e.target.value)}
                    placeholder="Calldata (0x)"
                    className="flex-1 rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <CircleNotch className="animate-spin" size={18} />
                  Submitting...
                </>
              ) : (
                "Submit Proposal"
              )}
            </button>
            {error && (
              <p className="text-sm text-red-500">Error: {error}</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
