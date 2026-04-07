import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: leadId } = await params

  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) return err('Lead not found', 404)

  const activities = await prisma.activity.findMany({
    where: { leadId },
    orderBy: { createdAt: 'desc' },
  })

  return ok(activities)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id: leadId } = await params
  const body = await req.json()
  const { type, note } = body

  if (!note) return err('note is required')

  const lead = await prisma.lead.findUnique({ where: { id: leadId } })
  if (!lead) return err('Lead not found', 404)

  const activity = await prisma.activity.create({
    data: {
      leadId,
      type: type ?? 'NOTE',
      note,
    },
  })

  return ok(activity, 201)
}
