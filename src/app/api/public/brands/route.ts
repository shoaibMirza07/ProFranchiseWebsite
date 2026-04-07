import { prisma } from '@/lib/prisma'
import { ok } from '@/lib/api-helpers'

export async function GET() {
  const brands = await prisma.brand.findMany({
    where: { displayOnWeb: true },
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { locations: true } },
    },
  })

  return ok(brands)
}
