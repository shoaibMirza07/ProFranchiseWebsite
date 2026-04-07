import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const status = searchParams.get('status')

  const contacts = await prisma.contact.findMany({
    where: {
      ...(status && { status }),
      ...(q && {
        OR: [
          { nameEn: { contains: q } },
          { nameAr: { contains: q } },
          { email: { contains: q } },
          { phone: { contains: q } },
          { title: { contains: q } },
        ],
      }),
    },
    include: {
      brandContacts: { include: { brand: { select: { id: true, nameEn: true, nameAr: true } } } },
      partnerContacts: { include: { partner: { select: { id: true, nameEn: true, nameAr: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return ok(contacts.map(c => ({
    ...c,
    brands: c.brandContacts.map(bc => ({ ...bc.brand, role: bc.role })),
    partners: c.partnerContacts.map(pc => ({ ...pc.partner, role: pc.role })),
  })))
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  const { nameEn, nameAr, title, email, phone, status, notes, brandId, partnerId, role } = body

  if (!nameEn) return err('nameEn is required')

  const contact = await prisma.contact.create({
    data: {
      nameEn,
      nameAr: nameAr ?? '',
      title: title ?? '',
      email: email ?? '',
      phone: phone ?? '',
      status: status ?? 'ACTIVE',
      notes: notes ?? '',
    },
  })

  if (brandId) {
    await prisma.brandContact.create({
      data: { brandId, contactId: contact.id, role: role ?? '' }
    }).catch(() => {})
  }
  if (partnerId) {
    await prisma.partnerContact.create({
      data: { partnerId, contactId: contact.id, role: role ?? '' }
    }).catch(() => {})
  }

  return ok(contact, 201)
}
