import { NextRequest } from 'next/server'
import { requireAuth, ok } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string; sectionId: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { sectionId } = await params
  const body = await req.json()

  const section = await prisma.pageSection.update({
    where: { id: sectionId },
    data: {
      ...(body.type !== undefined && { type: body.type }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.isVisible !== undefined && { isVisible: body.isVisible }),
      ...(body.contentEn !== undefined && {
        contentEn: typeof body.contentEn === 'string' ? body.contentEn : JSON.stringify(body.contentEn)
      }),
      ...(body.contentAr !== undefined && {
        contentAr: typeof body.contentAr === 'string' ? body.contentAr : JSON.stringify(body.contentAr)
      }),
    }
  })
  return ok(section)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { sectionId } = await params
  const body = await req.json()

  const section = await prisma.pageSection.update({
    where: { id: sectionId },
    data: {
      ...(body.isVisible !== undefined && { isVisible: body.isVisible }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.type !== undefined && { type: body.type }),
    }
  })
  return ok(section)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { sectionId } = await params
  await prisma.pageSection.delete({ where: { id: sectionId } })
  return ok({ success: true })
}
