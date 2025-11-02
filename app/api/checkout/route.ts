import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// POST /api/checkout - Create order from cart (same as POST /api/orders)
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
    const checkoutData = z
      .object({
        addressId: z.string(),
        paymentMethod: z.string(),
        paymentId: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(body);

    // Get user's cart
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate stock availability
    for (const item of cartItems) {
      if (!item.product.inStock || item.product.stockQuantity < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `${item.product.name} is out of stock or insufficient quantity`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
    const shipping = subtotal > 499 ? 0 : 50;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    // Verify address
    const address = await prisma.address.findFirst({
      where: {
        id: checkoutData.addressId,
        userId: user.id,
      },
    });

    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      );
    }

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          addressId: checkoutData.addressId,
          paymentMethod: checkoutData.paymentMethod,
          paymentId: checkoutData.paymentId,
          subtotal,
          shipping,
          tax,
          total,
          notes: checkoutData.notes,
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
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
                },
              },
            },
          },
        },
      });

      // Update product stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
            inStock: {
              // Set to false if stock reaches 0
              set: item.product.stockQuantity - item.quantity > 0,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      data: order,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
}
