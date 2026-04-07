import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const navItems = await prisma.navItem.findMany({
    orderBy: { order: 'asc' },
  })

  return ok(navItems)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  const { labelEn, labelAr, href, order, isActive, isExternal } = body

  if (!labelEn || !labelAr || !href) {
    return err('labelEn, labelAr, and href are required')
  }

  const navItem = await prisma.navItem.create({
    data: {
      labelEn,
      labelAr,
      href,
      order: order ?? 0,
      isActive: isActive ?? true,
      isExternal: isExternal ?? false,
    },
  })

  return ok(navItem, 201)
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  const items: { id: string; order: number }[] = Array.isArray(body) ? body : [body]

  if (!items.every((item) => item.id && item.order !== undefined)) {
    return err('Each item must have id and order')
  }

  const results = await Promise.all(
    items.map((item) =>
      prisma.navItem.update({
        where: { id: item.id },
        data: { order: item.order },
      })
    )
  )

  return ok(results)
}
