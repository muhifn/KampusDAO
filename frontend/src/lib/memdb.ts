export interface WhitelistRequest {
  id: string;
  walletAddress: string;
  name: string;
  studentId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export const db: WhitelistRequest[] = [];
