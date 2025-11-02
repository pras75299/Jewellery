import { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { env } from './env';

const JWT_SECRET = env.JWT_SECRET;

export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function setAuthCookie(token: string) {
  return `auth-token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400; ${
    env.NODE_ENV === 'production' ? 'Secure;' : ''
  }`;
}

export function clearAuthCookie() {
  return 'auth-token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0;';
}
