import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await req.json()

  const image = await prisma.galleryImage.update({
    where: { id },
    data: {
      ...(body.captionEn !== undefined && { captionEn: body.captionEn }),
      ...(body.captionAr !== undefined && { captionAr: body.captionAr }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.url !== undefined && { url: body.url }),
    },
  })

  return ok(image)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  await prisma.galleryImage.delete({
    where: { id },
  })

  return ok({ success: true })
}
