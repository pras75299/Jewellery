import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { z } from 'zod';

// GET /api/products/:id - Get a single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
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
          take: 10,
        },
      },
    });
    
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/:id - Update a product (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAdmin(request);
    
    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const updateData = z.object({
      name: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
      originalPrice: z.number().positive().optional(),
      image: z.string().url().optional(),
      images: z.array(z.string().url()).optional(),
      category: z.string().min(1).optional(),
      inStock: z.boolean().optional(),
      stockQuantity: z.number().int().optional(),
    }).parse(body);
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/:id - Delete a product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await requireAdmin(request);
    
    const { id } = await Promise.resolve(params);
    await prisma.product.delete({
      where: { id },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
