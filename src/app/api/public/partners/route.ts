import { prisma } from '@/lib/prisma'
import { ok } from '@/lib/api-helpers'

export async function GET() {
  const partners = await prisma.partner.findMany({
    where: { displayOnWeb: true },
    orderBy: { order: 'asc' },
  })

  return ok(partners)
}
