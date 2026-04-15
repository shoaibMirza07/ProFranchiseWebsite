import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const sections = await prisma.footerSection.findMany({
    include: {
      links: { orderBy: { order: 'asc' } },
    },
  })

  return ok(sections)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()

  // Support batch update: if body is an array, process each section
  if (Array.isArray(body)) {
    const results = []
    for (const section of body) {
      const result = await upsertFooterSection(section)
      if ('error' in result) return err(result.error, result.status)
      results.push(result.data)
    }
    return ok(results)
  }

  // Single object
  const result = await upsertFooterSection(body)
  if ('error' in result) return err(result.error, result.status)
  return ok(result.data, result.created ? 201 : 200)
}

type LinkInput = { labelEn: string; labelAr: string; href: string; order?: number }

async function upsertFooterSection(body: {
  id?: string; position?: string; titleEn?: string; titleAr?: string; links?: LinkInput[]
}): Promise<{ data: unknown; created?: boolean } | { error: string; status: number }> {
  const { id, position, titleEn, titleAr, links } = body

  if (!position) return { error: 'position is required', status: 400 }

  const linksData = links
    ? {
        links: {
          deleteMany: {},
          create: links.map((link, index) => ({
            labelEn: link.labelEn,
            labelAr: link.labelAr,
            href: link.href,
            order: link.order ?? index,
          })),
        },
      }
    : {}

  if (id) {
    const existing = await prisma.footerSection.findUnique({ where: { id } })
    if (!existing) return { error: 'Footer section not found', status: 404 }

    const section = await prisma.footerSection.update({
      where: { id },
      data: {
        position,
        titleEn: titleEn ?? null,
        titleAr: titleAr ?? null,
        ...linksData,
      },
      include: { links: { orderBy: { order: 'asc' } } },
    })

    return { data: section }
  }

  const section = await prisma.footerSection.create({
    data: {
      position,
      titleEn: titleEn ?? null,
      titleAr: titleAr ?? null,
      ...linksData,
    },
    include: { links: { orderBy: { order: 'asc' } } },
  })

  return { data: section, created: true }
}
