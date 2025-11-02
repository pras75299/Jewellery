import { GET, POST } from '@/app/api/products/route'
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
  requireAdmin: jest.fn(),
}))

describe('Products API', () => {
  const { getAuthUser, requireAdmin } = require('@/lib/auth')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Product 1',
          price: 1000,
          category: 'women',
          inStock: true,
        },
        {
          id: 'product-2',
          name: 'Product 2',
          price: 2000,
          category: 'men',
          inStock: true,
        },
      ]

      ;(mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)
      ;(mockPrisma.product.count as jest.Mock).mockResolvedValue(2)

      const request = new NextRequest('http://localhost/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
    })

    it('should filter products by category', async () => {
      const mockProducts = [
        {
          id: 'product-1',
          name: 'Product 1',
          price: 1000,
          category: 'women',
          inStock: true,
        },
      ]

      ;(mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)
      ;(mockPrisma.product.count as jest.Mock).mockResolvedValue(1)

      const request = new NextRequest('http://localhost/api/products?category=women')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'women',
          }),
        })
      )
    })
  })

  describe('POST /api/products', () => {
    it('should create product as admin', async () => {
      const mockAdmin = {
        id: 'admin-1',
        email: 'admin@jewellery.com',
        role: 'ADMIN',
      }

      requireAdmin.mockResolvedValue(mockAdmin)
      ;(mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(null)
      ;(mockPrisma.product.create as jest.Mock).mockResolvedValue({
        id: 'product-1',
        name: 'New Product',
        price: 1000,
        category: 'women',
        slug: 'new-product',
        image: 'https://example.com/image.jpg',
      })

    const request = new NextRequest('http://localhost/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'New Product',
        slug: 'new-product',
        price: 1000,
        category: 'women',
        image: 'https://example.com/image.jpg',
        inStock: true,
      }),
    })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('New Product')
    })

    it('should reject non-admin users', async () => {
      requireAdmin.mockRejectedValue(new Error('Unauthorized: Admin access required'))

    const request = new NextRequest('http://localhost/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'New Product',
        price: 1000,
      }),
    })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
    })
  })
})
