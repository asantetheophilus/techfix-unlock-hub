import { Redis } from "@upstash/redis";

const UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

let redis: Redis | null = null;

if (UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  });
}

// In-memory local fallback cache
const memoryCache = new Map<string, { count: number; expiresAt: number }>();

export async function rateLimit(
  ip: string,
  limit = 45,
  windowSeconds = 60
): Promise<{ success: boolean; limit: number; remaining: number }> {
  const key = `ratelimit:${ip}`;
  const now = Math.floor(Date.now() / 1000);

  if (redis) {
    try {
      const currentCount = (await redis.get<number>(key)) || 0;
      if (currentCount >= limit) {
        return { success: false, limit, remaining: 0 };
      }
      
      const pipeline = redis.pipeline();
      pipeline.incr(key);
      pipeline.expire(key, windowSeconds);
      await pipeline.exec();
      
      return { success: true, limit, remaining: limit - currentCount - 1 };
    } catch (error) {
      console.error("Upstash Redis rate limit failed. Failing open in development mode: ", error);
      return { success: true, limit, remaining: 1 };
    }
  }

  // Fallback in-memory cache
  const cacheItem = memoryCache.get(key);
  if (cacheItem && cacheItem.expiresAt > now) {
    if (cacheItem.count >= limit) {
      return { success: false, limit, remaining: 0 };
    }
    cacheItem.count += 1;
    return { success: true, limit, remaining: limit - cacheItem.count };
  } else {
    // Set or reset
    memoryCache.set(key, {
      count: 1,
      expiresAt: now + windowSeconds,
    });
    return { success: true, limit, remaining: limit - 1 };
  }
}
