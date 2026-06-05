import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/Toaster";
import { Navbar } from "@/components/Navbar";
import { Web3Provider } from "@/components/developers/Web3Provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KampusDAO - Campus Governance",
  description: "DAO Governance platform for campus with Soulbound NFT voting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        <Web3Provider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster />
        </Web3Provider>
      </body>
    </html>
  );
}