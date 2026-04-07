import { prisma } from '@/lib/prisma'
import { ok } from '@/lib/api-helpers'

export async function GET() {
  const images = await prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })

  return ok(images)
}
