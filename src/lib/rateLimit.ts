import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitRecord {
  timestamps: number[];
  lastCleanup: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale IP records every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastGlobalCleanup = Date.now();

function performCleanup(now: number) {
  if (now - lastGlobalCleanup < CLEANUP_INTERVAL_MS) return;
  lastGlobalCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    // If the record has no timestamps in the last 10 minutes, delete it
    const activeTimestamps = record.timestamps.filter((t) => now - t < 10 * 60 * 1000);
    if (activeTimestamps.length === 0) {
      rateLimitStore.delete(key);
    } else {
      record.timestamps = activeTimestamps;
    }
  }
}

/**
 * Extracts client IP from standard proxy headers
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return 'unknown_client';
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Checks and records a request under the sliding-window rate limiter
 */
export function checkRateLimit(
  namespace: string,
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  performCleanup(now);

  const key = `${namespace}:${identifier}`;
  const windowStart = now - config.windowMs;

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [], lastCleanup: now };
    rateLimitStore.set(key, record);
  }

  // Filter timestamps within the active sliding window
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  if (record.timestamps.length >= config.maxRequests) {
    const oldestTimestamp = record.timestamps[0] || now;
    const retryAfterMs = Math.max(1000, oldestTimestamp + config.windowMs - now);
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, config.maxRequests - record.timestamps.length);

  return {
    allowed: true,
    remaining,
    retryAfterSeconds: 0,
  };
}

/**
 * Generates a standard 429 Too Many Requests response with Retry-After header
 */
export function createRateLimitResponse(
  message: string,
  retryAfterSeconds: number
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + retryAfterSeconds),
      },
    }
  );
}
