import { NextRequest } from 'next/server'
import { ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const brand = await prisma.brand.findFirst({
    where: { slug, displayOnWeb: true },
    include: {
      locations: { orderBy: { order: 'asc' } },
      contacts: { include: { contact: true } },
    },
  })

  if (!brand) return err('Brand not found', 404)

  return ok(brand)
}
