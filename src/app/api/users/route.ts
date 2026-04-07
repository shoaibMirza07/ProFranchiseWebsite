import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const auth = await requireAuth(['ADMIN'])
  if (auth.error) return auth.error

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'asc' },
  })

  return ok(users)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(['ADMIN'])
  if (auth.error) return auth.error

  const body = await req.json()
  const { name, email, password, role, isActive } = body

  if (!name || !email || !password) {
    return err('name, email, and password are required')
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return err('A user with this email already exists', 409)

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role ?? 'SALES',
      isActive: isActive ?? true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return ok(user, 201)
}
