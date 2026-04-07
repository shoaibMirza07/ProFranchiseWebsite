import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const pages = await prisma.page.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { sections: true } } }
  })
  return ok(pages)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  const { titleEn, titleAr, slug, isPublished, order } = body

  if (!titleEn?.trim() || !slug?.trim()) {
    return err('titleEn and slug are required')
  }

  const existing = await prisma.page.findUnique({ where: { slug } })
  if (existing) return err('A page with this slug already exists', 409)

  const page = await prisma.page.create({
    data: {
      titleEn: titleEn.trim(),
      titleAr: titleAr?.trim() || '',
      slug: slug.trim(),
      isPublished: isPublished ?? true,
      order: order ?? 0
    }
  })
  return ok(page, 201)
}
