import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const members = await prisma.teamMember.findMany({
    orderBy: { order: 'asc' },
  })

  return ok(members)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  const {
    nameEn, nameAr, titleEn, titleAr, bioEn, bioAr,
    photoUrl, displayOnWeb, order, linkedIn,
    testimonialEn, testimonialAr, isLeadership, xHandle,
  } = body

  if (!nameEn || !nameAr || !titleEn || !titleAr) {
    return err('nameEn, nameAr, titleEn, and titleAr are required')
  }

  const member = await (prisma as any).teamMember.create({
    data: {
      nameEn,
      nameAr,
      titleEn,
      titleAr,
      bioEn: bioEn ?? '',
      bioAr: bioAr ?? '',
      photoUrl: photoUrl ?? null,
      displayOnWeb: displayOnWeb ?? true,
      order: order ?? 0,
      linkedIn: linkedIn ?? null,
      testimonialEn: testimonialEn ?? '',
      testimonialAr: testimonialAr ?? '',
      isLeadership: isLeadership ?? false,
      xHandle: xHandle ?? '',
    },
  })

  return ok(member, 201)
}
