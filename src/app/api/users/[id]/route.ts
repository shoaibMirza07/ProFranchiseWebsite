import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(['ADMIN'])
  if (auth.error) return auth.error

  const { id } = await params

  const user = await prisma.user.findUnique({
    where: { id },
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

  if (!user) return err('User not found', 404)

  return ok(user)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(['ADMIN'])
  if (auth.error) return auth.error

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) return err('User not found', 404)

  if (body.email && body.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: body.email } })
    if (emailTaken) return err('Email already in use', 409)
  }

  let hashedPassword: string | undefined
  if (body.password) {
    hashedPassword = await bcrypt.hash(body.password, 10)
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.email !== undefined && { email: body.email }),
      ...(hashedPassword !== undefined && { password: hashedPassword }),
      ...(body.role !== undefined && { role: body.role }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
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

  return ok(user)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(['ADMIN'])
  if (auth.error) return auth.error

  const { id } = await params
  const currentUserId = auth.session!.user.id as string

  if (id === currentUserId) {
    return err('You cannot delete your own account', 400)
  }

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) return err('User not found', 404)

  await prisma.user.delete({ where: { id } })

  return ok({ message: 'User deleted' })
}
