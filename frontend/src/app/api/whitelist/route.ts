import { NextResponse } from "next/server";
import { WhitelistRequest } from "@/lib/memdb";
import { getAllRequests, saveRequest, updateRequest } from "@/lib/kv";

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET() {
  try {
    const requests = await getAllRequests();
    return NextResponse.json(requests);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to load whitelist requests"
    );
  }
}

export async function POST(request: Request) {
  try {
    const { walletAddress, name, studentId } = await request.json();

    if (!walletAddress || !name || !studentId) {
      return jsonError("Missing fields", 400);
    }

    const requests = await getAllRequests();
    const exists = requests.find(
      (req) => req.walletAddress === walletAddress && req.status === "pending"
    );
    if (exists) {
      return jsonError("Request already exists", 409);
    }

    const newRequest: WhitelistRequest = {
      id: Date.now().toString(),
      walletAddress,
      name,
      studentId,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await saveRequest(newRequest);
    return NextResponse.json(newRequest);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to save whitelist request"
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    const updated = await updateRequest(id, { status });
    if (!updated) {
      return jsonError("Request not found", 404);
    }

    return NextResponse.json(updated);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to update whitelist request"
    );
  }
}
