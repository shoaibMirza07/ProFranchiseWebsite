import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const page = await prisma.page.findUnique({
    where: { id },
    include: { sections: { orderBy: { order: 'asc' } } }
  })
  if (!page) return err('Not found', 404)
  return ok(page)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await req.json()
  const { titleEn, titleAr, isPublished, order, sections } = body

  const page = await prisma.page.update({
    where: { id },
    data: {
      ...(titleEn !== undefined && { titleEn }),
      ...(titleAr !== undefined && { titleAr }),
      ...(isPublished !== undefined && { isPublished }),
      ...(order !== undefined && { order }),
    }
  })

  // If sections array provided, replace all sections
  if (Array.isArray(sections)) {
    await prisma.pageSection.deleteMany({ where: { pageId: id } })
    for (const s of sections) {
      await prisma.pageSection.create({
        data: {
          pageId: id,
          type: s.type || 'custom',
          order: s.order ?? 0,
          isVisible: s.isVisible ?? true,
          contentEn: typeof s.contentEn === 'string' ? s.contentEn : JSON.stringify(s.contentEn || {}),
          contentAr: typeof s.contentAr === 'string' ? s.contentAr : JSON.stringify(s.contentAr || {}),
        }
      })
    }
  }

  return ok(page)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await req.json()

  const page = await prisma.page.update({
    where: { id },
    data: {
      ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
      ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
      ...(body.titleAr !== undefined && { titleAr: body.titleAr }),
      ...(body.order !== undefined && { order: body.order }),
    }
  })
  return ok(page)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAuth(['ADMIN'])
  if (auth.error) return auth.error

  const { id } = await params
  await prisma.page.delete({ where: { id } })
  return ok({ success: true })
}
