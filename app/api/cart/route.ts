import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addToCartSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive().default(1),
});

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
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
      orderBy: { createdAt: 'desc' },
    });

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      data: {
        items: cartItems,
        total,
        itemCount,
      },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
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
    const { productId, quantity } = addToCartSchema.parse(body);

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product.inStock) {
      return NextResponse.json(
        { success: false, error: 'Product is out of stock' },
        { status: 400 }
      );
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
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
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity,
        },
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
    }

    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      data: cartItem,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Add to cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Cart cleared',
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
