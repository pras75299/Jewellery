import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { validateCsrf } from '@/lib/csrf';
import { sanitizeHtml } from '@/lib/sanitize';
import { z } from 'zod';

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// GET /api/reviews?productId=xxx - Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        averageRating: Math.round(averageRating * 10) / 10,
        count: reviews.length,
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create or update a review
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const user = await getAuthUser(request);

    if (!user) {
      logger.security('Unauthorized review attempt', { path: '/api/reviews', method: 'POST', ip });
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate CSRF token
    const csrfValid = await validateCsrf(request);
    if (!csrfValid) {
      logger.security('CSRF validation failed', { path: '/api/reviews', method: 'POST', ip, userId: user.id });
      return NextResponse.json(
        { success: false, error: 'CSRF token validation failed' },
        { status: 403 }
      );
    }

    logger.request('POST', '/api/reviews', ip, user.id);

    const body = await request.json();
    const reviewData = reviewSchema.parse(body);
    
    // Sanitize HTML in comment
    if (reviewData.comment) {
      reviewData.comment = sanitizeHtml(reviewData.comment);
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: reviewData.productId },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user has ordered this product
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        productId: reviewData.productId,
        order: {
          userId: user.id,
          status: 'DELIVERED',
        },
      },
    });

    // Create or update review
    const review = await prisma.review.upsert({
      where: {
        userId_productId: {
          userId: user.id,
          productId: reviewData.productId,
        },
      },
      update: {
        rating: reviewData.rating,
        comment: reviewData.comment,
      },
      create: {
        userId: user.id,
        productId: reviewData.productId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        verified: !!hasOrdered,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update product rating
    const allReviews = await prisma.review.findMany({
      where: { productId: reviewData.productId },
    });

    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: reviewData.productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create review error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
