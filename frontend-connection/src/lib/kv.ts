import { Redis } from "@upstash/redis";
import { WhitelistRequest, db as inMemoryDb } from "./memdb";

const kvUrl = process.env.VERCEL_KV_URL;
const kvToken = process.env.VERCEL_KV_TOKEN;
const redisUrl = process.env.REDIS_URL;
const redisToken = process.env.REDIS_TOKEN;
const prefix = "whitelist:";
const client = kvUrl && kvToken
  ? new Redis({ url: kvUrl, token: kvToken })
  : redisUrl
  ? new Redis({ url: redisUrl, token: redisToken })
  : null;
const isProduction = process.env.NODE_ENV === "production";

function ensureClient() {
  if (client) return;
  if (isProduction) {
    throw new Error(
      "Persistent Redis is not configured. Set REDIS_URL (and optional REDIS_TOKEN) in Vercel, or set VERCEL_KV_URL/VERCEL_KV_TOKEN."
    );
  }
}

export async function getAllRequests(): Promise<WhitelistRequest[]> {
  if (!client) {
    ensureClient();
    return inMemoryDb;
  }

  const requests: WhitelistRequest[] = [];
  let cursor = "0";

  do {
    const [nextCursor, keys] = await client.scan(cursor, {
      match: `${prefix}*`,
      count: 100,
    });
    cursor = nextCursor as string;

    if (keys.length > 0) {
      const values = await Promise.all(keys.map((key) => client.get(key)));
      values.forEach((value) => {
        if (!value) return;
        const request = typeof value === "string"
          ? (JSON.parse(value) as WhitelistRequest)
          : (value as WhitelistRequest);
        if (request) requests.push(request);
      });
    }
  } while (cursor !== "0");

  return requests;
}

export async function getRequest(id: string): Promise<WhitelistRequest | null> {
  if (!client) {
    ensureClient();
    return inMemoryDb.find((req) => req.id === id) ?? null;
  }

  const value = await client.get(`${prefix}${id}`);
  if (!value) return null;
  return typeof value === "string"
    ? (JSON.parse(value) as WhitelistRequest)
    : (value as WhitelistRequest);
}

export async function saveRequest(request: WhitelistRequest): Promise<WhitelistRequest> {
  if (!client) {
    ensureClient();
    inMemoryDb.push(request);
    return request;
  }

  await client.set(`${prefix}${request.id}`, JSON.stringify(request));
  return request;
}

export async function updateRequest(
  id: string,
  updates: Partial<Pick<WhitelistRequest, "status">>
): Promise<WhitelistRequest | null> {
  if (!client) {
    ensureClient();
    const index = inMemoryDb.findIndex((req) => req.id === id);
    if (index === -1) return null;
    inMemoryDb[index] = { ...inMemoryDb[index], ...updates };
    return inMemoryDb[index];
  }

  const existing = await getRequest(id);
  if (!existing) return null;
  const updated = { ...existing, ...updates };
  await client.set(`${prefix}${id}`, JSON.stringify(updated));
  return updated;
}
