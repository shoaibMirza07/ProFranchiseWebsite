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

  const member = await prisma.teamMember.findUnique({ where: { id } })
  if (!member) return err('Team member not found', 404)

  return ok(member)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.teamMember.findUnique({ where: { id } })
  if (!existing) return err('Team member not found', 404)

  const member = await (prisma as any).teamMember.update({
    where: { id },
    data: {
      ...(body.nameEn !== undefined && { nameEn: body.nameEn }),
      ...(body.nameAr !== undefined && { nameAr: body.nameAr }),
      ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
      ...(body.titleAr !== undefined && { titleAr: body.titleAr }),
      ...(body.bioEn !== undefined && { bioEn: body.bioEn }),
      ...(body.bioAr !== undefined && { bioAr: body.bioAr }),
      ...(body.photoUrl !== undefined && { photoUrl: body.photoUrl }),
      ...(body.displayOnWeb !== undefined && { displayOnWeb: body.displayOnWeb }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.linkedIn !== undefined && { linkedIn: body.linkedIn }),
      ...(body.testimonialEn !== undefined && { testimonialEn: body.testimonialEn }),
      ...(body.testimonialAr !== undefined && { testimonialAr: body.testimonialAr }),
      ...(body.isLeadership !== undefined && { isLeadership: body.isLeadership }),
      ...(body.xHandle !== undefined && { xHandle: body.xHandle }),
    },
  })

  return ok(member)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params

  const existing = await prisma.teamMember.findUnique({ where: { id } })
  if (!existing) return err('Team member not found', 404)

  await prisma.teamMember.delete({ where: { id } })

  return ok({ message: 'Team member deleted' })
}
