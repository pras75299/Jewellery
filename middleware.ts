import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiting (for production, use Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP
const MAX_REQUEST_SIZE = 1024 * 1024; // 1MB

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  const path = request.nextUrl.pathname;
  return `${ip}:${path}`;
}

function checkRateLimit(key: string): boolean {
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

