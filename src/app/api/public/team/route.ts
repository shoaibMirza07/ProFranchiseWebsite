import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ok } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const leadership = searchParams.get('leadership')
  const members = await (prisma as any).teamMember.findMany({
    where: {
      displayOnWeb: true,
      ...(leadership === 'true' && { isLeadership: true }),
      ...(leadership === 'false' && { isLeadership: false }),
    },
    orderBy: { order: 'asc' },
  })
  return ok(members)
}
