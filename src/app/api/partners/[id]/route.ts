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

  const partner = await prisma.partner.findUnique({
    where: { id },
    include: { contacts: { include: { contact: true } } },
  })

  if (!partner) return err('Partner not found', 404)

  return ok(partner)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.partner.findUnique({ where: { id } })
  if (!existing) return err('Partner not found', 404)

  const partner = await prisma.partner.update({
    where: { id },
    data: {
      ...(body.nameEn !== undefined && { nameEn: body.nameEn }),
      ...(body.nameAr !== undefined && { nameAr: body.nameAr }),
      ...(body.descriptionEn !== undefined && { descriptionEn: body.descriptionEn }),
      ...(body.descriptionAr !== undefined && { descriptionAr: body.descriptionAr }),
      ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
      ...(body.displayOnWeb !== undefined && { displayOnWeb: body.displayOnWeb }),
      ...(body.order !== undefined && { order: body.order }),
    },
  })

  return ok(partner)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params

  const existing = await prisma.partner.findUnique({ where: { id } })
  if (!existing) return err('Partner not found', 404)

  await prisma.partner.delete({ where: { id } })

  return ok({ message: 'Partner deleted' })
}
