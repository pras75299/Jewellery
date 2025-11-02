import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
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
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: wishlistItems,
      count: wishlistItems.length,
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get wishlist' },
      { status: 500 }
    );
  }
}

// POST /api/wishlist - Add item to wishlist
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
    const { productId } = z.object({ productId: z.string() }).parse(body);

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

    // Check if already in wishlist
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Product already in wishlist' },
        { status: 400 }
      );
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId,
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
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Item added to wishlist',
      data: wishlistItem,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Add to wishlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to wishlist' },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlist - Remove item from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (!wishlistItem) {
      return NextResponse.json(
        { success: false, error: 'Item not in wishlist' },
        { status: 404 }
      );
    }

    await prisma.wishlistItem.delete({
      where: { id: wishlistItem.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Item removed from wishlist',
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove item from wishlist' },
      { status: 500 }
    );
  }
}
