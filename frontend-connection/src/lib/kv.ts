import { Redis } from "ioredis";
import { WhitelistRequest, db as inMemoryDb } from "./memdb";

const redisUrl = process.env.REDIS_URL;
const kvUrl = process.env.VERCEL_KV_URL;
const kvToken = process.env.VERCEL_KV_TOKEN;
const prefix = "whitelist:";

let client: Redis | null = null;

if (kvUrl && kvToken) {
  client = new Redis(kvUrl, { token: kvToken } as any);
} else if (redisUrl) {
  try {
    client = new Redis(redisUrl, { maxRetriesPerRequest: 2, lazyConnect: true });
    client.on("error", () => { client = null; });
  } catch {
    client = null;
  }
}

const isProduction = process.env.NODE_ENV === "production";

function ensureClient() {
  if (client) return;
  if (isProduction) {
    console.warn("Redis not configured, using in-memory fallback");
  }
}

export async function getAllRequests(): Promise<WhitelistRequest[]> {
  if (!client) {
    ensureClient();
    return inMemoryDb;
  }

  const requests: WhitelistRequest[] = [];
  let cursor = "0";

  try {
    do {
      const result = await client.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 100);
      cursor = result[0];
      const keys = result[1];

      if (keys.length > 0) {
        const values = await Promise.all(keys.map((key) => client!.get(key)));
        values.forEach((value) => {
          if (!value) return;
          try {
            const request = JSON.parse(value as string) as WhitelistRequest;
            if (request) requests.push(request);
          } catch { /* skip invalid */ }
        });
      }
    } while (cursor !== "0");
  } catch {
    return inMemoryDb;
  }

  return requests;
}

export async function getRequest(id: string): Promise<WhitelistRequest | null> {
  if (!client) {
    ensureClient();
    return inMemoryDb.find((req) => req.id === id) ?? null;
  }

  try {
    const value = await client.get(`${prefix}${id}`);
    if (!value) return null;
    return JSON.parse(value) as WhitelistRequest;
  } catch {
    return inMemoryDb.find((req) => req.id === id) ?? null;
  }
}

export async function saveRequest(request: WhitelistRequest): Promise<WhitelistRequest> {
  if (!client) {
    ensureClient();
    inMemoryDb.push(request);
    return request;
  }

  try {
    await client.set(`${prefix}${request.id}`, JSON.stringify(request));
  } catch {
    inMemoryDb.push(request);
  }
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

  try {
    const existing = await getRequest(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    await client.set(`${prefix}${id}`, JSON.stringify(updated));
    return updated;
  } catch {
    const index = inMemoryDb.findIndex((req) => req.id === id);
    if (index === -1) return null;
    inMemoryDb[index] = { ...inMemoryDb[index], ...updates };
    return inMemoryDb[index];
  }
}
