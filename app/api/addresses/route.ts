import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(10),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(5),
  country: z.string().default('India'),
  isDefault: z.boolean().default(false),
});

// GET /api/addresses - Get user's addresses
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get addresses' },
      { status: 500 }
    );
  }
}

// POST /api/addresses - Create a new address
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const addressData = addressSchema.parse(body);

    // If this is set as default, unset others
    if (addressData.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        ...addressData,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Address added successfully',
      data: address,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create address error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
