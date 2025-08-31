// Simple in-memory rate limiting for development
// In production, use Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private windowMs: number
  private maxRequests: number

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
    this.windowMs = windowMs
    this.maxRequests = maxRequests
  }

  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.store.set(key, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: now + this.windowMs
      }
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    entry.count++
    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }

  cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// Global rate limiter instances
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5) // 5 requests per 15 minutes for auth
export const apiRateLimiter = new RateLimiter(60 * 1000, 60) // 60 requests per minute for API

// Clean up expired entries every 5 minutes
setInterval(() => {
  authRateLimiter.cleanup()
  apiRateLimiter.cleanup()
}, 5 * 60 * 1000)