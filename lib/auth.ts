import { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { prisma } from './prisma';

// Lazy load env to avoid validation errors during Prisma CLI operations
function getEnv() {
  try {
    const { env } = require('./env');
    return env;
  } catch {
    // Fallback for Prisma CLI operations
    return {
      JWT_SECRET: process.env.JWT_SECRET || '',
      NODE_ENV: process.env.NODE_ENV || 'development',
    };
  }
}

const getJWTSecret = () => {
  const env = getEnv();
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in environment variables');
  }
  return env.JWT_SECRET;
};

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getJWTSecret();
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
}

export async function requireAdmin(request: NextRequest) {
  const user = await getAuthUser(request);
  
  if (!user) {
    throw new Error('Not authenticated');
  }
  
  if (user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
  
  return user;
}

export function generateToken(payload: JWTPayload): string {
  const secret = getJWTSecret();
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

export function setAuthCookie(token: string) {
  const env = getEnv();
  return `auth-token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400; ${
    env.NODE_ENV === 'production' ? 'Secure;' : ''
  }`;
}

export function clearAuthCookie() {
  return 'auth-token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;';
}
