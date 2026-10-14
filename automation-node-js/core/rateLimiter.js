/**
 * Layer 12: Rate-Limiting Anti-Ban Algorithm (Token Bucket with Randomized Jitter).
 */
export class RateLimiter {
  constructor(burstCapacity = 10, fillRatePerMinute = 2) {
    this.capacity = burstCapacity;
    this.tokens = burstCapacity;
    this.fillRate = fillRatePerMinute;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsedMinutes = (now - this.lastRefill) / (1000 * 60);
    const addedTokens = elapsedMinutes * this.fillRate;
    this.tokens = Math.min(this.capacity, this.tokens + addedTokens);
    this.lastRefill = now;
  }

  async acquireToken() {
    this.refill();
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    // Token bucket empty: execute adaptive cooldown
    const cooldownMs = 15000 + Math.random() * 15000; // 15-30s adaptive interval
    console.log(`[RateLimiter] Burst limit reached. Pausing for ${(cooldownMs / 1000).toFixed(1)}s cooldown...`);
    await new Promise(r => setTimeout(r, cooldownMs));
    this.refill();
    this.tokens = Math.max(0, this.tokens - 1);
    return true;
  }
}
