import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: pageId } = await params
  const body = await req.json()
  const { type, order, isVisible, contentEn, contentAr } = body

  if (!type) return err('type is required')

  const section = await prisma.pageSection.create({
    data: {
      pageId,
      type,
      order: order ?? 0,
      isVisible: isVisible ?? true,
      contentEn: typeof contentEn === 'string' ? contentEn : JSON.stringify(contentEn || {}),
      contentAr: typeof contentAr === 'string' ? contentAr : JSON.stringify(contentAr || {}),
    }
  })
  return ok(section, 201)
}
