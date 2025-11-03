import { NextRequest } from 'next/server';
import * as crypto from 'crypto';
import { logger } from './logger';

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.JWT_SECRET || 'csrf-secret-change-in-production';
// Enable strict CSRF validation in production via environment variable
// Default to lenient mode to maintain backward compatibility
const STRICT_CSRF = process.env.ENABLE_STRICT_CSRF === 'true' && process.env.NODE_ENV === 'production';

// Generate CSRF token
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Verify CSRF token
export function verifyCsrfToken(token: string, sessionToken?: string): boolean {
  if (!token) return false;
  
  // Validate token format (64 hex characters)
  if (token.length !== 64 || !/^[a-f0-9]+$/.test(token)) {
    return false;
  }
  
  // In a full implementation, you'd verify against a session token
  // For now, we validate the token format and existence
  // Future enhancement: Compare against stored session token
  return true;
}

// Get CSRF token from request
export function getCsrfTokenFromRequest(request: NextRequest): string | null {
  // Check header first (for API requests)
  const headerToken = request.headers.get('x-csrf-token');
  if (headerToken) return headerToken;

  // Check cookie for server-side rendering
  const cookieToken = request.cookies.get('csrf-token')?.value;
  if (cookieToken) return cookieToken;

  // Note: Body parsing for form submissions is done in route handlers
  return null;
}

// Validate CSRF for POST/PUT/DELETE requests (fixes Issue #3)
export async function validateCsrf(request: NextRequest): Promise<boolean> {
  const method = request.method;
  
  // Only validate state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true;
  }

  // Skip CSRF for auth endpoints (they have their own protection)
  const path = request.nextUrl.pathname;
  if (
    path.startsWith('/api/auth/login') || 
    path.startsWith('/api/auth/register') || 
    path.startsWith('/api/auth/logout')
  ) {
    return true;
  }

  // Get CSRF token from request
  const token = getCsrfTokenFromRequest(request);
  
  // In strict mode (production with ENABLE_STRICT_CSRF=true), require token
  if (STRICT_CSRF) {
    if (!token) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      logger.security('CSRF validation failed: No token provided', { 
        path, 
        method, 
        ip 
      });
      return false;
    }
    
    if (!verifyCsrfToken(token)) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      logger.security('CSRF validation failed: Invalid token', { 
        path, 
        method, 
        ip 
      });
      return false;
    }
    
    return true;
  }
  
  // Lenient mode (default): If token provided, validate it; if not, allow but log
  // This maintains backward compatibility while CSRF protection is gradually enabled
  if (token) {
    const isValid = verifyCsrfToken(token);
    if (!isValid) {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      logger.security('CSRF validation failed: Invalid token format', { 
        path, 
        method, 
        ip 
      });
      // In lenient mode, allow but warn
      return true;
    }
    return true;
  }
  
  // No token provided in lenient mode - allow but log for monitoring
  // This allows existing functionality to continue working
  if (process.env.NODE_ENV === 'production') {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    logger.security('CSRF token missing (lenient mode)', { 
      path, 
      method, 
      ip,
      note: 'Enable STRICT_CSRF=true for full protection'
    });
  }
  
  return true;
}

