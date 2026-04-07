import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const brands = await prisma.brand.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: { select: { locations: true } },
    },
  })

  return ok(brands)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  const {
    slug, nameEn, nameAr, descriptionEn, descriptionAr, logoUrl,
    displayOnWeb, order, netWorthEn, netWorthAr, liquidCapitalEn,
    liquidCapitalAr, experienceEn, experienceAr, siteProfileEn,
    siteProfileAr, whyPointsEn, whyPointsAr,
  } = body

  if (!slug || !nameEn || !nameAr) {
    return err('slug, nameEn, and nameAr are required')
  }

  const existing = await prisma.brand.findUnique({ where: { slug } })
  if (existing) return err('A brand with this slug already exists', 409)

  const brand = await prisma.brand.create({
    data: {
      slug,
      nameEn,
      nameAr,
      descriptionEn: descriptionEn ?? '',
      descriptionAr: descriptionAr ?? '',
      logoUrl: logoUrl ?? null,
      displayOnWeb: displayOnWeb ?? true,
      order: order ?? 0,
      netWorthEn: netWorthEn ?? '',
      netWorthAr: netWorthAr ?? '',
      liquidCapitalEn: liquidCapitalEn ?? '',
      liquidCapitalAr: liquidCapitalAr ?? '',
      experienceEn: experienceEn ?? '',
      experienceAr: experienceAr ?? '',
      siteProfileEn: siteProfileEn ?? '',
      siteProfileAr: siteProfileAr ?? '',
      whyPointsEn: whyPointsEn ?? '[]',
      whyPointsAr: whyPointsAr ?? '[]',
    },
  })

  return ok(brand, 201)
}
