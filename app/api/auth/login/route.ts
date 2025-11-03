import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    
    logger.request('POST', '/api/auth/login', ip);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      logger.security('Failed login attempt - user not found', { email: validatedData.email, ip });
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      logger.security('Failed login attempt - invalid password', { email: validatedData.email, userId: user.id, ip });
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    logger.info('User logged in successfully', { userId: user.id, email: user.email, ip });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email, role: user.role });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      maxAge: 86400, // 24 hours
      secure: process.env.NODE_ENV === 'production',
    });

    // Return response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to login' },
      { status: 500 }
    );
  }
}
