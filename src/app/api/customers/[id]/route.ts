import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params

  const customer = await (prisma as any).customer.findUnique({
    where: { id },
    include: {
      contacts: { include: { contact: true } },
      leads: {
        include: { assignedTo: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!customer) return err('Customer not found', 404)

  return ok({
    ...customer,
    contacts: customer.contacts.map((cc: { contact: Record<string, unknown>; role: string }) => ({ ...cc.contact, role: cc.role })),
  })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await req.json()

  const existing = await (prisma as any).customer.findUnique({ where: { id } }).catch(() => null)
  if (!existing) return err('Customer not found', 404)

  const customer = await (prisma as any).customer.update({
    where: { id },
    data: {
      ...(body.nameEn !== undefined && { nameEn: body.nameEn }),
      ...(body.nameAr !== undefined && { nameAr: body.nameAr }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.industry !== undefined && { industry: body.industry }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.status !== undefined && { status: body.status }),
    },
  })

  return ok(customer)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params

  const existing = await (prisma as any).customer.findUnique({ where: { id } }).catch(() => null)
  if (!existing) return err('Customer not found', 404)

  await (prisma as any).customer.delete({ where: { id } })

  return ok({ message: 'Customer deleted' })
}
