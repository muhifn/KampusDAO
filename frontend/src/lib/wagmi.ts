import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'KampusDAO',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'), // More reliable public RPC for getLogs
  },
  ssr: true,
});
