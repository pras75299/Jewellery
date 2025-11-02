import { POST } from '@/app/api/auth/login/route'
import { NextRequest } from 'next/server'
import { createMockPrisma } from '../../helpers/mock-prisma'
import bcrypt from 'bcryptjs'

// Mock dependencies
jest.mock('@/lib/prisma', () => {
  const { createMockPrisma } = require('../../helpers/mock-prisma');
  return {
    prisma: createMockPrisma(),
  };
})

// Get mockPrisma after mock is set up
const mockPrisma = require('@/lib/prisma').prisma

jest.mock('bcryptjs')
const mockCookiesSet = jest.fn()
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    set: mockCookiesSet,
  })),
}))

jest.mock('@/lib/auth', () => ({
  generateToken: jest.fn(() => 'mock-token'),
}))

describe('POST /api/auth/login', () => {
  const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login user with valid credentials', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'Test User',
      phone: '+1234567890',
      role: 'USER',
    }

    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    mockBcrypt.compare.mockResolvedValue(true as never)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.email).toBe('test@example.com')
    expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password')
  })

  it('should return error for invalid email', async () => {
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid email or password')
  })

  it('should return error for invalid password', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      password: 'hashed-password',
      name: 'Test User',
      phone: '+1234567890',
      role: 'USER',
    }

    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
    mockBcrypt.compare.mockResolvedValue(false as never)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid email or password')
  })

  it('should return error for invalid input', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'invalid-email',
        password: '',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })
})
