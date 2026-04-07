import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      brandContacts: { include: { brand: true } },
      partnerContacts: { include: { partner: true } },
    },
  })

  if (!contact) return err('Contact not found', 404)

  return ok({
    ...contact,
    brands: contact.brandContacts.map((bc) => ({ ...bc.brand, role: bc.role })),
    partners: contact.partnerContacts.map((pc) => ({ ...pc.partner, role: pc.role })),
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.contact.findUnique({ where: { id } })
  if (!existing) return err('Contact not found', 404)

  const contact = await prisma.contact.update({
    where: { id },
    data: {
      ...(body.nameEn !== undefined && { nameEn: body.nameEn }),
      ...(body.nameAr !== undefined && { nameAr: body.nameAr }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  })

  return ok(contact)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params

  const existing = await prisma.contact.findUnique({ where: { id } })
  if (!existing) return err('Contact not found', 404)

  await prisma.contact.delete({ where: { id } })

  return ok({ message: 'Contact deleted' })
}
