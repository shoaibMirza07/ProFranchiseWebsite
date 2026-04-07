import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const images = await prisma.galleryImage.findMany({
    orderBy: { order: 'asc' },
  })

  return ok(images)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  const { url, captionEn, captionAr, order, isActive } = body

  if (!url) return err('url is required')

  const image = await prisma.galleryImage.create({
    data: {
      url,
      captionEn: captionEn ?? '',
      captionAr: captionAr ?? '',
      order: order ?? 0,
      isActive: isActive ?? true,
    },
  })

  return ok(image, 201)
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return err('id query param is required')

  const existing = await prisma.galleryImage.findUnique({ where: { id } })
  if (!existing) return err('Image not found', 404)

  await prisma.galleryImage.delete({ where: { id } })

  return ok({ message: 'Image deleted' })
}
