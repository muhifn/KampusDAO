"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useAdmin } from "@/hooks/useAdmin";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { Shield } from "@phosphor-icons/react";

export function Navbar() {
  const { isConnected, address } = useAccount();
  const { isAdmin } = useAdmin(address);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
          KampusDAO
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/dao" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/proposals" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Proposals
          </Link>
          <Link href="/elections" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Elections
          </Link>
          {isConnected && (
            <>
              <Link href="/profile" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                Profile
              </Link>
              {isAdmin && (
                <Link href="/admin" className="inline-flex items-center gap-1 text-sm font-medium text-emerald-400 transition-colors hover:text-emerald-300">
                  <Shield size={16} />
                  Admin
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}