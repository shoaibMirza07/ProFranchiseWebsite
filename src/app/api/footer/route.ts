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
  const { id, position, titleEn, titleAr, links } = body

  if (!position) return err('position is required')

  if (id) {
    const existing = await prisma.footerSection.findUnique({ where: { id } })
    if (!existing) return err('Footer section not found', 404)

    const section = await prisma.footerSection.update({
      where: { id },
      data: {
        position,
        titleEn: titleEn ?? null,
        titleAr: titleAr ?? null,
        ...(links && {
          links: {
            deleteMany: {},
            create: (links as { labelEn: string; labelAr: string; href: string; order?: number }[]).map((link, index) => ({
              labelEn: link.labelEn,
              labelAr: link.labelAr,
              href: link.href,
              order: link.order ?? index,
            })),
          },
        }),
      },
      include: { links: { orderBy: { order: 'asc' } } },
    })

    return ok(section)
  }

  const section = await prisma.footerSection.create({
    data: {
      position,
      titleEn: titleEn ?? null,
      titleAr: titleAr ?? null,
      ...(links && {
        links: {
          create: (links as { labelEn: string; labelAr: string; href: string; order?: number }[]).map((link, index) => ({
            labelEn: link.labelEn,
            labelAr: link.labelAr,
            href: link.href,
            order: link.order ?? index,
          })),
        },
      }),
    },
    include: { links: { orderBy: { order: 'asc' } } },
  })

  return ok(section, 201)
}
