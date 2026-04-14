import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await req.json()

  const navItem = await prisma.navItem.update({
    where: { id },
    data: {
      ...(body.labelEn !== undefined && { labelEn: body.labelEn }),
      ...(body.labelAr !== undefined && { labelAr: body.labelAr }),
      ...(body.href !== undefined && { href: body.href }),
      ...(body.order !== undefined && { order: body.order }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.isExternal !== undefined && { isExternal: body.isExternal }),
    },
  })

  return ok(navItem)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  await prisma.navItem.delete({
    where: { id },
  })

  return ok({ success: true })
}
