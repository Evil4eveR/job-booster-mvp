/**
 * In-memory rate limiter for API routes.
 * Limits to maxRequests per windowMs per IP address.
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private entries: Map<string, RateLimitEntry> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if a request from the given key (IP) is allowed.
   * Returns { allowed: boolean, remaining: number, resetTime: number }
   */
  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.entries.get(key);

    // Clean up expired entries periodically
    if (this.entries.size > 10000) {
      this.cleanup(now);
    }

    if (!entry || now > entry.resetTime) {
      // New window
      const resetTime = now + this.windowMs;
      this.entries.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime };
    }

    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    return { allowed: true, remaining: this.maxRequests - entry.count, resetTime: entry.resetTime };
  }

  private cleanup(now: number): void {
    for (const [key, entry] of this.entries) {
      if (now > entry.resetTime) {
        this.entries.delete(key);
      }
    }
  }

  /** Reset all entries (useful for testing) */
  reset(): void {
    this.entries.clear();
  }
}

// Singleton rate limiters for different API routes
export const generateRateLimiter = new RateLimiter(5, 60000); // 5 req/min for generation
export const uploadRateLimiter = new RateLimiter(10, 60000);  // 10 req/min for uploads
export const paymentRateLimiter = new RateLimiter(5, 60000);  // 5 req/min for payments
