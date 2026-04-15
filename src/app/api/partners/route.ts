import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    const partners = await prisma.partner.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        descriptionEn: true,
        descriptionAr: true,
        logoUrl: true,
        websiteUrl: true,
        displayOnWeb: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return ok(partners)
  } catch (e: any) {
    return err(e.message, 500)
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  const {
    nameEn, nameAr, descriptionEn, descriptionAr,
    logoUrl, websiteUrl, displayOnWeb, order,
  } = body

  if (!nameEn || !nameAr) {
    return err('nameEn and nameAr are required')
  }

  const partner = await prisma.partner.create({
    data: {
      nameEn,
      nameAr,
      descriptionEn: descriptionEn ?? '',
      descriptionAr: descriptionAr ?? '',
      logoUrl: logoUrl ?? null,
      websiteUrl: websiteUrl ?? '',
      displayOnWeb: displayOnWeb ?? true,
      order: order ?? 0,
    },
  })

  return ok(partner, 201)
}
