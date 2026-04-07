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

  const contacts = await prisma.brandContact.findMany({
    where: { brandId: id },
    include: { contact: true },
  })

  return ok(contacts.map((bc) => ({ ...bc.contact, role: bc.role })))
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: brandId } = await params
  const body = await req.json()

  const brand = await prisma.brand.findUnique({ where: { id: brandId } })
  if (!brand) return err('Brand not found', 404)

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

  const existing = await prisma.brandContact.findUnique({
    where: { brandId_contactId: { brandId, contactId } },
  })
  if (existing) return err('Contact already linked to this brand', 409)

  const link = await prisma.brandContact.create({
    data: { brandId, contactId, role: body.role ?? '' },
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

  const { id: brandId } = await params
  const body = await req.json()
  const { contactId, role } = body

  if (!contactId) return err('contactId is required')

  const link = await prisma.brandContact.update({
    where: { brandId_contactId: { brandId, contactId } },
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

  const { id: brandId } = await params
  const { searchParams } = new URL(req.url)
  const contactId = searchParams.get('contactId')

  if (!contactId) return err('contactId query param is required')

  const link = await prisma.brandContact.findUnique({
    where: { brandId_contactId: { brandId, contactId } },
  })
  if (!link) return err('Contact link not found', 404)

  await prisma.brandContact.delete({
    where: { brandId_contactId: { brandId, contactId } },
  })

  return ok({ message: 'Contact unlinked' })
}
