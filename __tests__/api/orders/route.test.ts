import { GET, POST } from '@/app/api/orders/route'
import { NextRequest } from 'next/server'
import { createMockPrisma } from '../../helpers/mock-prisma'

// Mock dependencies
jest.mock('@/lib/prisma', () => {
  const { createMockPrisma } = require('../../helpers/mock-prisma');
  return {
    prisma: createMockPrisma(),
  };
})

// Get mockPrisma after mock is set up
const mockPrisma = require('@/lib/prisma').prisma

jest.mock('@/lib/auth', () => ({
  getAuthUser: jest.fn(),
}))

describe('Orders API', () => {
  const { getAuthUser } = require('@/lib/auth')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/orders', () => {
    it('should return user orders', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'USER',
      }

      const mockOrders = [
        {
          id: 'order-1',
          userId: 'user-1',
          total: 1500,
          status: 'PENDING',
          orderItems: [],
        },
      ]

      getAuthUser.mockResolvedValue(mockUser)
      ;(mockPrisma.order.findMany as jest.Mock).mockResolvedValue(mockOrders)

      const request = new NextRequest('http://localhost/api/orders')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(1)
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
        })
      )
    })

    it('should return 401 when user is not authenticated', async () => {
      getAuthUser.mockResolvedValue(null)

      const request = new NextRequest('http://localhost/api/orders')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Not authenticated')
    })
  })

  describe('POST /api/orders', () => {
    it('should create order successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'USER',
      }

      const mockCartItems = [
        {
          id: 'cart-1',
          userId: 'user-1',
          productId: 'product-1',
          quantity: 2,
          product: {
            id: 'product-1',
            name: 'Product 1',
            price: 1000,
            inStock: true,
            stockQuantity: 10,
          },
        },
      ]

      const mockAddress = {
        id: 'address-1',
        userId: 'user-1',
      }

      getAuthUser.mockResolvedValue(mockUser)
      ;(mockPrisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockCartItems)
      ;(mockPrisma.address.findFirst as jest.Mock).mockResolvedValue(mockAddress)
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        return await callback(mockPrisma)
      })
      ;(mockPrisma.order.create as jest.Mock).mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        total: 2360, // 2000 + 0 shipping + 360 GST (18%)
      })

      const request = new NextRequest('http://localhost/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          addressId: 'address-1',
          paymentMethod: 'cod',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should return error when cart is empty', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'USER',
      }

      getAuthUser.mockResolvedValue(mockUser)
      ;(mockPrisma.cartItem.findMany as jest.Mock).mockResolvedValue([])

    const request2 = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addressId: 'address-1',
        paymentMethod: 'cod',
      }),
    })

      const response = await POST(request2)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('Cart is empty')
    })

    it('should return error when product is out of stock', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        role: 'USER',
      }

      const mockCartItems = [
        {
          id: 'cart-1',
          userId: 'user-1',
          productId: 'product-1',
          quantity: 2,
          product: {
            id: 'product-1',
            name: 'Product 1',
            price: 1000,
            inStock: false,
            stockQuantity: 0,
          },
        },
      ]

      getAuthUser.mockResolvedValue(mockUser)
      ;(mockPrisma.cartItem.findMany as jest.Mock).mockResolvedValue(mockCartItems)

    const request3 = new NextRequest('http://localhost/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addressId: 'address-1',
        paymentMethod: 'cod',
      }),
    })

      const response = await POST(request3)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('out of stock')
    })
  })
})
