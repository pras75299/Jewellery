import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// PUT /api/cart/:id - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { quantity } = z.object({ quantity: z.number().int().positive() }).parse(body);

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            originalPrice: true,
            image: true,
            images: true,
            category: true,
            inStock: true,
            rating: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Cart item updated',
      data: updatedItem,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Update cart item error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart/:id - Remove item from cart
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      );
    }

    await prisma.cartItem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}
