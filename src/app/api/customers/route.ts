import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const status = searchParams.get('status')

  try {
    const customers = await (prisma as any).customer.findMany({
      where: {
        ...(status && { status }),
        ...(q && {
          OR: [
            { nameEn: { contains: q } },
            { nameAr: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
            { industry: { contains: q } },
          ],
        }),
      },
      include: {
        contacts: { include: { contact: { select: { id: true, nameEn: true, title: true, email: true } } } },
        _count: { select: { leads: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return ok(customers.map((c: any) => ({
      ...c,
      contacts: c.contacts.map((cc: any) => ({ ...cc.contact, role: cc.role })),
      leadsCount: c._count.leads,
    })))
  } catch {
    return ok([])
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  const { nameEn, nameAr, email, phone, industry, notes, status } = body

  if (!nameEn) return err('nameEn is required')

  try {
    const customer = await (prisma as any).customer.create({
      data: {
        nameEn,
        nameAr: nameAr ?? '',
        email: email ?? '',
        phone: phone ?? '',
        industry: industry ?? '',
        notes: notes ?? '',
        status: status ?? 'ACTIVE',
      },
    })
    return ok(customer, 201)
  } catch {
    return err('Customer model not available. Run: npm run db:push', 503)
  }
}
