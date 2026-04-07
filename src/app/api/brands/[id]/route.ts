import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params

  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      locations: { orderBy: { order: 'asc' } },
      contacts: { include: { contact: true } },
    },
  })

  if (!brand) return err('Brand not found', 404)

  return ok(brand)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.brand.findUnique({ where: { id } })
  if (!existing) return err('Brand not found', 404)

  if (body.slug && body.slug !== existing.slug) {
    const slugTaken = await prisma.brand.findUnique({ where: { slug: body.slug } })
    if (slugTaken) return err('A brand with this slug already exists', 409)
  }

  const brand = await prisma.brand.update({
    where: { id },
    data: {
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.nameEn !== undefined && { nameEn: body.nameEn }),
      ...(body.nameAr !== undefined && { nameAr: body.nameAr }),
      ...(body.descriptionEn !== undefined && { descriptionEn: body.descriptionEn }),
      ...(body.descriptionAr !== undefined && { descriptionAr: body.descriptionAr }),
      ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
      ...(body.displayOnWeb !== undefined && { displayOnWeb: body.displayOnWeb }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.netWorthEn !== undefined && { netWorthEn: body.netWorthEn }),
      ...(body.netWorthAr !== undefined && { netWorthAr: body.netWorthAr }),
      ...(body.liquidCapitalEn !== undefined && { liquidCapitalEn: body.liquidCapitalEn }),
      ...(body.liquidCapitalAr !== undefined && { liquidCapitalAr: body.liquidCapitalAr }),
      ...(body.experienceEn !== undefined && { experienceEn: body.experienceEn }),
      ...(body.experienceAr !== undefined && { experienceAr: body.experienceAr }),
      ...(body.siteProfileEn !== undefined && { siteProfileEn: body.siteProfileEn }),
      ...(body.siteProfileAr !== undefined && { siteProfileAr: body.siteProfileAr }),
      ...(body.whyPointsEn !== undefined && { whyPointsEn: body.whyPointsEn }),
      ...(body.whyPointsAr !== undefined && { whyPointsAr: body.whyPointsAr }),
    },
  })

  return ok(brand)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params

  const existing = await prisma.brand.findUnique({ where: { id } })
  if (!existing) return err('Brand not found', 404)

  await prisma.brand.delete({ where: { id } })

  return ok({ message: 'Brand deleted' })
}
