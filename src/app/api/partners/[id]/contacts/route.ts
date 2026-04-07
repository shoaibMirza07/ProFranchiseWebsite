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

  const partner = await prisma.partner.findUnique({ where: { id } })
  if (!partner) return err('Partner not found', 404)

  const contacts = await prisma.partnerContact.findMany({
    where: { partnerId: id },
    include: { contact: true },
  })

  return ok(contacts.map((pc) => ({ ...pc.contact, role: pc.role })))
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: partnerId } = await params
  const body = await req.json()

  const partner = await prisma.partner.findUnique({ where: { id: partnerId } })
  if (!partner) return err('Partner not found', 404)

  let contactId: string

  if (body.contactId) {
    const contact = await prisma.contact.findUnique({ where: { id: body.contactId } })
    if (!contact) return err('Contact not found', 404)
    contactId = body.contactId
  } else {
    const { nameEn, nameAr, title, email, phone, status } = body
    if (!nameEn) return err('nameEn is required when creating a new contact')

    const newContact = await prisma.contact.create({
      data: {
        nameEn,
        nameAr: nameAr ?? '',
        title: title ?? '',
        email: email ?? '',
        phone: phone ?? '',
        status: status ?? 'ACTIVE',
      },
    })
    contactId = newContact.id
  }

  const existing = await prisma.partnerContact.findUnique({
    where: { partnerId_contactId: { partnerId, contactId } },
  })
  if (existing) return err('Contact already linked to this partner', 409)

  const link = await prisma.partnerContact.create({
    data: { partnerId, contactId, role: body.role ?? '' },
    include: { contact: true },
  })

  return ok({ ...link.contact, role: link.role }, 201)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: partnerId } = await params
  const body = await req.json()
  const { contactId, role } = body

  if (!contactId) return err('contactId is required')

  const link = await prisma.partnerContact.update({
    where: { partnerId_contactId: { partnerId, contactId } },
    data: { role: role ?? '' },
    include: { contact: true },
  })

  return ok({ ...link.contact, role: link.role })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: partnerId } = await params
  const { searchParams } = new URL(req.url)
  const contactId = searchParams.get('contactId')

  if (!contactId) return err('contactId query param is required')

  const link = await prisma.partnerContact.findUnique({
    where: { partnerId_contactId: { partnerId, contactId } },
  })
  if (!link) return err('Contact link not found', 404)

  await prisma.partnerContact.delete({
    where: { partnerId_contactId: { partnerId, contactId } },
  })

  return ok({ message: 'Contact unlinked' })
}
