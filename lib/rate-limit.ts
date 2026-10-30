type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * 极简内存限流。单进程够用；以后多实例部署再换 Redis。
 * 返回 true 表示放行。
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (b.count >= limit) return false;

  b.count += 1;
  return true;
}

// 定期清理，避免内存一直涨
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) {
      if (v.resetAt < now) buckets.delete(k);
    }
  }, 60_000).unref?.();
}
