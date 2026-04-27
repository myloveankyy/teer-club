import IORedis from "ioredis";

let redisClient: IORedis | null = null;

const CACHE_TTL = 86400;

function getClient(): IORedis {
  if (!redisClient) {
    redisClient = new IORedis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6381"),
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
    });

    redisClient.on("error", (err) => {
      console.error("[ScrapeCache] Redis error:", err.message);
    });

    redisClient.on("connect", () => {
      console.log("[ScrapeCache] Connected to Redis");
    });
  }
  return redisClient;
}

function getCacheKey(url: string): string {
  const hash = Buffer.from(url).toString("base64").substring(0, 32);
  return `scrape:${hash}`;
}

export async function getCachedResults(url: string): Promise<any[] | null> {
  if (process.env.CACHE_ENABLED !== "true") return null;

  try {
    const client = getClient();
    await client.connect().catch(() => { });

    const key = getCacheKey(url);
    const cached = await client.get(key);

    if (cached) {
      console.log(`[ScrapeCache] HIT: ${url}`);
      return JSON.parse(cached);
    }

    console.log(`[ScrapeCache] MISS: ${url}`);
    return null;
  } catch (err: any) {
    console.error("[ScrapeCache] Get error:", err.message);
    return null;
  }
}

export async function setCachedResults(url: string, results: any[]): Promise<void> {
  if (process.env.CACHE_ENABLED !== "true") return;
  if (results.length === 0) return;

  try {
    const client = getClient();
    await client.connect().catch(() => { });

    const key = getCacheKey(url);
    await client.setex(key, CACHE_TTL, JSON.stringify(results));

    console.log(`[ScrapeCache] Cached ${results.length} results`);
  } catch (err: any) {
    console.error("[ScrapeCache] Set error:", err.message);
  }
}

export async function invalidateCache(url: string): Promise<void> {
  try {
    const client = getClient();
    await client.connect().catch(() => { });

    const key = getCacheKey(url);
    await client.del(key);

    console.log(`[ScrapeCache] Invalidated: ${url}`);
  } catch (err: any) {
    console.error("[ScrapeCache] Invalidate error:", err.message);
  }
}

export async function flushCache(): Promise<void> {
  try {
    const client = getClient();
    await client.connect().catch(() => { });
    await client.flushall();
    console.log("[ScrapeCache] Cache flushed completely");
  } catch (err: any) {
    console.error("[ScrapeCache] Flush error:", err.message);
  }
}

export async function closeCache(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}