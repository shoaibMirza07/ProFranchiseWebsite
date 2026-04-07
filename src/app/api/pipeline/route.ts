import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(['ADMIN', 'MANAGER', 'SALES'])
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const stage = searchParams.get('stage')
  const inquiryType = searchParams.get('inquiryType')
  const assignedToId = searchParams.get('assignedToId')
  const q = searchParams.get('q')

  const where = {
    ...(stage && { stage }),
    ...(inquiryType && { inquiryType }),
    ...(assignedToId && { assignedToId }),
    ...(q && {
      OR: [
        { fullName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
        { company: { contains: q } },
        { message: { contains: q } },
      ],
    }),
  }

  // Try with new relations (available after db:push), fall back to base query
  let leads
  try {
    leads = await (prisma.lead.findMany as Function)({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        contact: { select: { id: true, nameEn: true, email: true, phone: true } },
        brand: { select: { id: true, nameEn: true } },
        partner: { select: { id: true, nameEn: true } },
        customer: { select: { id: true, nameEn: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    leads = await prisma.lead.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  return ok(leads)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(['ADMIN', 'MANAGER', 'SALES'])
  if (auth.error) return auth.error

  const body = await req.json()
  const {
    fullName, email, phone, inquiryType, company, message,
    source, stage, priority, notes, proposalValue, expectedClose,
    assignedToId, contactId, brandId, partnerId, customerId,
  } = body

  if (!fullName) return err('fullName is required')

  // Try to create with new fields (after db:push), fall back to base fields
  let lead
  try {
    lead = await (prisma.lead.create as Function)({
      data: {
        fullName,
        email: email ?? '',
        phone: phone ?? '',
        inquiryType: inquiryType ?? 'GENERAL',
        company: company ?? '',
        message: message ?? '',
        source: source ?? 'website',
        stage: stage ?? 'NEW',
        priority: priority ?? 'MEDIUM',
        notes: notes ?? '',
        proposalValue: proposalValue ?? null,
        expectedClose: expectedClose ? new Date(expectedClose) : null,
        assignedToId: assignedToId ?? null,
        contactId: contactId || null,
        brandId: brandId || null,
        partnerId: partnerId || null,
        customerId: customerId || null,
        createdById: auth.session!.user.id as string,
      },
    })
  } catch {
    lead = await prisma.lead.create({
      data: {
        fullName,
        email: email ?? '',
        phone: phone ?? '',
        inquiryType: inquiryType ?? 'GENERAL',
        company: company ?? '',
        message: message ?? '',
        source: source ?? 'website',
        stage: stage ?? 'NEW',
        priority: priority ?? 'MEDIUM',
        notes: notes ?? '',
        proposalValue: proposalValue ?? null,
        expectedClose: expectedClose ? new Date(expectedClose) : null,
        assignedToId: assignedToId ?? null,
        createdById: auth.session!.user.id as string,
      },
    })
  }

  return ok(lead, 201)
}
