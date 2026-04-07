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

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { createdAt: 'desc' } },
      assignedTo: { select: { id: true, name: true, email: true, role: true } },
    },
  })

  if (!lead) return err('Lead not found', 404)

  return ok(lead)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.lead.findUnique({ where: { id } })
  if (!existing) return err('Lead not found', 404)

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(body.stage !== undefined && { stage: body.stage }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.assignedToId !== undefined && { assignedToId: body.assignedToId }),
      ...(body.proposalValue !== undefined && { proposalValue: body.proposalValue }),
      ...(body.expectedClose !== undefined && {
        expectedClose: body.expectedClose ? new Date(body.expectedClose) : null,
      }),
      ...(body.fullName !== undefined && { fullName: body.fullName }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.inquiryType !== undefined && { inquiryType: body.inquiryType }),
      ...(body.company !== undefined && { company: body.company }),
      ...(body.message !== undefined && { message: body.message }),
      ...(body.source !== undefined && { source: body.source }),
    },
  })

  return ok(lead)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(['ADMIN'])
  if (auth.error) return auth.error

  const { id } = await params

  const existing = await prisma.lead.findUnique({ where: { id } })
  if (!existing) return err('Lead not found', 404)

  await prisma.lead.delete({ where: { id } })

  return ok({ message: 'Lead deleted' })
}
