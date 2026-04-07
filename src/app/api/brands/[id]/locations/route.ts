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

  const brand = await prisma.brand.findUnique({ where: { id } })
  if (!brand) return err('Brand not found', 404)

  const locations = await prisma.brandLocation.findMany({
    where: { brandId: id },
    orderBy: { order: 'asc' },
  })

  return ok(locations)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await req.json()
  const { cityEn, cityAr, areaEn, areaAr, typeEn, typeAr, order } = body

  if (!cityEn || !cityAr || !areaEn || !areaAr || !typeEn || !typeAr) {
    return err('cityEn, cityAr, areaEn, areaAr, typeEn, and typeAr are required')
  }

  const brand = await prisma.brand.findUnique({ where: { id } })
  if (!brand) return err('Brand not found', 404)

  const location = await prisma.brandLocation.create({
    data: {
      brandId: id,
      cityEn,
      cityAr,
      areaEn,
      areaAr,
      typeEn,
      typeAr,
      order: order ?? 0,
    },
  })

  return ok(location, 201)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: brandId } = await params
  const body = await req.json()
  const { locationId, cityEn, cityAr, areaEn, areaAr, typeEn, typeAr, order } = body

  if (!locationId) return err('locationId is required in body')

  const location = await prisma.brandLocation.findFirst({
    where: { id: locationId, brandId },
  })
  if (!location) return err('Location not found', 404)

  const updated = await prisma.brandLocation.update({
    where: { id: locationId },
    data: {
      ...(cityEn !== undefined && { cityEn }),
      ...(cityAr !== undefined && { cityAr }),
      ...(areaEn !== undefined && { areaEn }),
      ...(areaAr !== undefined && { areaAr }),
      ...(typeEn !== undefined && { typeEn }),
      ...(typeAr !== undefined && { typeAr }),
      ...(order !== undefined && { order }),
    },
  })

  return ok(updated)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: brandId } = await params
  const { searchParams } = new URL(req.url)
  const locationId = searchParams.get('locationId')

  if (!locationId) return err('locationId query param is required')

  const location = await prisma.brandLocation.findFirst({
    where: { id: locationId, brandId },
  })
  if (!location) return err('Location not found', 404)

  await prisma.brandLocation.delete({ where: { id: locationId } })

  return ok({ message: 'Location deleted' })
}
