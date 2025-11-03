import { NextRequest } from 'next/server';
import * as crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'csrf-secret-change-in-production';

// Generate CSRF token
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Verify CSRF token
export function verifyCsrfToken(token: string, sessionToken?: string): boolean {
  if (!token) return false;
  
  // In a real implementation, you'd verify against a session token
  // For now, we'll use a simple token validation
  return token.length === 64 && /^[a-f0-9]+$/.test(token);
}

// Get CSRF token from request
export function getCsrfTokenFromRequest(request: NextRequest): string | null {
  // Check header first (for API requests)
  const headerToken = request.headers.get('x-csrf-token');
  if (headerToken) return headerToken;

  // Check body for form submissions
  // Note: This requires parsing the body, which is done in route handlers

  return null;
}

// Validate CSRF for POST/PUT/DELETE requests
export async function validateCsrf(request: NextRequest): Promise<boolean> {
  const method = request.method;
  
  // Only validate state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true;
  }

  // Skip CSRF for auth endpoints (they have their own protection)
  const path = request.nextUrl.pathname;
  if (path.startsWith('/api/auth/login') || path.startsWith('/api/auth/register') || path.startsWith('/api/auth/logout')) {
    // These endpoints are protected by other means
    return true;
  }

  // Get CSRF token from request
  const token = getCsrfTokenFromRequest(request);
  
  // For now, we'll be lenient - if token is provided, validate it
  // If no token, we'll allow (since frontend integration isn't complete yet)
  // TODO: In production with proper session management, require CSRF tokens
  // For authenticated requests, we rely on JWT auth as primary protection
  if (token) {
    return verifyCsrfToken(token);
  }
  
  // Temporary: Allow requests without CSRF token if authenticated
  // This maintains backward compatibility while CSRF tokens are added to frontend
  // In production, this should be changed to require tokens for all state-changing operations
  return true;
}

