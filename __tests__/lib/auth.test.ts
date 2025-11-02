import * as jwt from 'jsonwebtoken'
import { createMockPrisma } from '../helpers/mock-prisma'

// Mock dependencies BEFORE importing the module under test
jest.mock('jsonwebtoken')
jest.mock('@/lib/prisma', () => ({
  prisma: createMockPrisma(),
}))

// Get the mock Prisma instance after it's created
const mockPrisma = require('@/lib/prisma').prisma

// Now import after mocks are set up
import { generateToken, verifyToken, getAuthUser, requireAdmin } from '@/lib/auth'
import { NextRequest } from 'next/server'

jest.mock('@/lib/env', () => ({
  env: {
    JWT_SECRET: 'test-secret-key-at-least-32-characters-long',
    NODE_ENV: 'test',
  },
}))

describe('Auth Utilities', () => {
  const mockJWT = jwt as jest.Mocked<typeof jwt>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { userId: 'user-1', email: 'test@example.com', role: 'USER' }
      const mockToken = 'mock-jwt-token'
      
      mockJWT.sign.mockReturnValue(mockToken as any)

      const token = generateToken(payload)

      expect(mockJWT.sign).toHaveBeenCalledWith(
        payload,
        'test-secret-key-at-least-32-characters-long',
        { expiresIn: '24h' }
      )
      expect(token).toBe(mockToken)
    })
  })

  describe('verifyToken', () => {
    it('should verify and return payload for valid token', async () => {
      const mockPayload = { userId: 'user-1', email: 'test@example.com', role: 'USER' }
      const token = 'valid-token'
      
      mockJWT.verify.mockReturnValue(mockPayload as any)

      const result = await verifyToken(token)

      expect(mockJWT.verify).toHaveBeenCalledWith(
        token,
        'test-secret-key-at-least-32-characters-long'
      )
      expect(result).toEqual(mockPayload)
    })

    it('should return null for invalid token', async () => {
      const token = 'invalid-token'
      
      mockJWT.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = await verifyToken(token)

      expect(result).toBeNull()
    })
  })

  describe('getAuthUser', () => {
    it('should return user for valid token', async () => {
      const mockPayload = { userId: 'user-1', email: 'test@example.com', role: 'USER' }
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
        role: 'USER',
      }

      mockJWT.verify.mockReturnValue(mockPayload as any)
      ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const request = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-token' }),
        },
      } as unknown as NextRequest

      const result = await getAuthUser(request)

      expect(result).toEqual(mockUser)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
        },
      })
    })

    it('should return null when no token provided', async () => {
      const request = {
        cookies: {
          get: jest.fn().mockReturnValue(undefined),
        },
      } as unknown as NextRequest

      const result = await getAuthUser(request)

      expect(result).toBeNull()
      expect(mockJWT.verify).not.toHaveBeenCalled()
    })

    it('should return null when token is invalid', async () => {
      mockJWT.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const request = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'invalid-token' }),
        },
      } as unknown as NextRequest

      const result = await getAuthUser(request)

      expect(result).toBeNull()
    })
  })

  describe('requireAdmin', () => {
    it('should return admin user for valid admin token', async () => {
      const mockPayload = { userId: 'admin-1', email: 'admin@jewellery.com', role: 'ADMIN' }
      const mockAdmin = {
        id: 'admin-1',
        email: 'admin@jewellery.com',
        name: 'Admin User',
        phone: '+1234567890',
        role: 'ADMIN',
      }

      mockJWT.verify.mockReturnValue(mockPayload as any)
      ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdmin)

      const request = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'admin-token' }),
        },
      } as unknown as NextRequest

      const result = await requireAdmin(request)

      expect(result).toEqual(mockAdmin)
    })

    it('should throw error for non-admin user', async () => {
      const mockPayload = { userId: 'user-1', email: 'test@example.com', role: 'USER' }
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        phone: '+1234567890',
        role: 'USER',
      }

      mockJWT.verify.mockReturnValue(mockPayload as any)
      ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const request = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'user-token' }),
        },
      } as unknown as NextRequest

      await expect(requireAdmin(request)).rejects.toThrow('Unauthorized: Admin access required')
    })

    it('should throw error when user not authenticated', async () => {
      const request = {
        cookies: {
          get: jest.fn().mockReturnValue(undefined),
        },
      } as unknown as NextRequest

      await expect(requireAdmin(request)).rejects.toThrow('Not authenticated')
    })
  })
})
