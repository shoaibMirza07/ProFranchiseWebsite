import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: customerId } = await params
  const body = await req.json()

  const customer = await prisma.customer.findUnique({ where: { id: customerId } })
  if (!customer) return err('Customer not found', 404)

  let contactId: string

  if (body.contactId) {
    const contact = await prisma.contact.findUnique({ where: { id: body.contactId } })
    if (!contact) return err('Contact not found', 404)
    contactId = body.contactId
  } else {
    const { nameEn, nameAr, title, email, phone } = body
    if (!nameEn) return err('nameEn is required when creating a new contact')
    const newContact = await prisma.contact.create({
      data: { nameEn, nameAr: nameAr ?? '', title: title ?? '', email: email ?? '', phone: phone ?? '' },
    })
    contactId = newContact.id
  }

  const existing = await prisma.customerContact.findUnique({
    where: { customerId_contactId: { customerId, contactId } },
  })
  if (existing) return err('Contact already linked', 409)

  const link = await prisma.customerContact.create({
    data: { customerId, contactId, role: body.role ?? '' },
    include: { contact: true },
  })

  return ok({ ...link.contact, role: link.role }, 201)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: customerId } = await params
  const { searchParams } = new URL(req.url)
  const contactId = searchParams.get('contactId')

  if (!contactId) return err('contactId is required')

  await prisma.customerContact.delete({
    where: { customerId_contactId: { customerId, contactId } },
  })

  return ok({ message: 'Contact unlinked' })
}
