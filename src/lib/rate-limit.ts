import { LRUCache } from "lru-cache";

const cache = new LRUCache<string, number[]>({ max: 500 });

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 10;

export function rateLimit(key: string): { allowed: boolean } {
  const now = Date.now();
  const timestamps = (cache.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  cache.set(key, timestamps);
  return { allowed: timestamps.length <= MAX_REQUESTS };
}
