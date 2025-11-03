import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiting with automatic cleanup (fixes Issue #2)
// For production with multiple instances, consider using Redis/Upstash
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP
const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB
const CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean up every 5 minutes
const MAX_MAP_SIZE = 10000; // Prevent unbounded growth

// Cleanup expired entries periodically
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  
  // Only cleanup if enough time has passed or map is getting large
  if (now - lastCleanup < CLEANUP_INTERVAL && rateLimitMap.size < MAX_MAP_SIZE) {
    return;
  }
  
  lastCleanup = now;
  let cleaned = 0;
  
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
      cleaned++;
    }
  }
  
  // If map is still too large after cleanup, remove oldest entries
  if (rateLimitMap.size > MAX_MAP_SIZE) {
    const entries = Array.from(rateLimitMap.entries())
      .sort((a, b) => a[1].resetTime - b[1].resetTime);
    
    const toRemove = entries.slice(0, Math.floor(entries.length * 0.2)); // Remove 20% oldest
    toRemove.forEach(([key]) => rateLimitMap.delete(key));
  }
}

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  const path = request.nextUrl.pathname;
  return `${ip}:${path}`;
}

function checkRateLimit(key: string): boolean {
  // Cleanup expired entries periodically (fixes Issue #10 and #2)
  cleanupExpiredEntries();
  
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

function checkRequestSize(request: NextRequest): boolean {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    return parseInt(contentLength, 10) <= MAX_REQUEST_SIZE;
  }
  return true;
}

export async function middleware(request: NextRequest) {
  // Skip rate limiting for static assets
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/health') ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Check request size
  if (!checkRequestSize(request)) {
    return NextResponse.json(
      { success: false, error: 'Request too large' },
      { status: 413 }
    );
  }

  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const rateLimitKey = getRateLimitKey(request);
    
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

