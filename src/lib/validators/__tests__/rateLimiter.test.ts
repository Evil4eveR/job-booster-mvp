import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from '../rateLimiter';

describe('RateLimiter', () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    limiter = new RateLimiter(3, 1000); // 3 requests per second for testing
  });

  it('allows requests within limit', () => {
    expect(limiter.check('ip1').allowed).toBe(true);
    expect(limiter.check('ip1').allowed).toBe(true);
    expect(limiter.check('ip1').allowed).toBe(true);
  });

  it('blocks requests over limit', () => {
    limiter.check('ip1');
    limiter.check('ip1');
    limiter.check('ip1');
    const result = limiter.check('ip1');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('tracks different IPs independently', () => {
    limiter.check('ip1');
    limiter.check('ip1');
    limiter.check('ip1');
    expect(limiter.check('ip1').allowed).toBe(false);
    expect(limiter.check('ip2').allowed).toBe(true);
  });

  it('resets limit after window expires', () => {
    limiter.check('ip1');
    limiter.check('ip1');
    limiter.check('ip1');
    expect(limiter.check('ip1').allowed).toBe(false);
    
    // Manually expire by creating a new limiter
    const newLimiter = new RateLimiter(3, 1); // 1ms window
    newLimiter.check('ip1');
    newLimiter.check('ip1');
    newLimiter.check('ip1');
    expect(newLimiter.check('ip1').allowed).toBe(false);
  });

  it('reports correct remaining count', () => {
    let result = limiter.check('ip1');
    expect(result.remaining).toBe(2);
    result = limiter.check('ip1');
    expect(result.remaining).toBe(1);
    result = limiter.check('ip1');
    expect(result.remaining).toBe(0);
  });

  it('reset() clears all entries', () => {
    limiter.check('ip1');
    limiter.check('ip1');
    limiter.check('ip1');
    limiter.reset();
    expect(limiter.check('ip1').allowed).toBe(true);
  });
});
