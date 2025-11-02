import { POST } from '@/app/api/auth/register/route'
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
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    set: jest.fn(),
  })),
}))

jest.mock('@/lib/auth', () => ({
  generateToken: jest.fn(() => 'mock-token'),
}))

describe('POST /api/auth/register', () => {
  const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register new user successfully', async () => {
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    mockBcrypt.hash.mockResolvedValue('hashed-password' as never)
    ;(mockPrisma.user.create as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'newuser@example.com',
      name: 'New User',
      phone: '+1234567890',
      role: 'USER',
    })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User',
        phone: '+1234567890',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.email).toBe('newuser@example.com')
    expect(mockBcrypt.hash).toHaveBeenCalledWith('Password123!', 10)
  })

  it('should return error if user already exists', async () => {
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-1',
      email: 'existing@example.com',
    })

    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'existing@example.com',
        password: 'Password123!',
        name: 'Existing User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.error).toBe('User with this email already exists')
  })

  it('should return error for weak password', async () => {
    const request = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'weak',
        name: 'New User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
  })
})
