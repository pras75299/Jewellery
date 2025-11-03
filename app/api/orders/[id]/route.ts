import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/orders/:id - Get a single order
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Handle params - could be a Promise or object (Next.js 15 compatibility)
    const { id } = await Promise.resolve(params);

    const order = await prisma.order.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      include: {
        address: true,
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true,
                price: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get order' },
      { status: 500 }
    );
  }
}
