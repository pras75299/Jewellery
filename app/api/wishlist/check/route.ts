import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/wishlist/check?productId=xxx - Check if product is in wishlist
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json({
        success: true,
        data: { isInWishlist: false },
      });
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

    return NextResponse.json({
      success: true,
      data: { isInWishlist: !!wishlistItem },
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check wishlist' },
      { status: 500 }
    );
  }
}
