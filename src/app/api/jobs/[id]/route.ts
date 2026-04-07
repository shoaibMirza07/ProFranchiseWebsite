import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(['ADMIN', 'MANAGER'])
  if (auth.error) return auth.error

  const { id } = await params

  const applicant = await prisma.jobApplicant.findUnique({ where: { id } })
  if (!applicant) return err('Applicant not found', 404)

  return ok(applicant)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(['ADMIN', 'MANAGER'])
  if (auth.error) return auth.error

  const { id } = await params
  const body = await req.json()

  const existing = await prisma.jobApplicant.findUnique({ where: { id } })
  if (!existing) return err('Applicant not found', 404)

  const applicant = await prisma.jobApplicant.update({
    where: { id },
    data: {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.fullName !== undefined && { fullName: body.fullName }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.nationality !== undefined && { nationality: body.nationality }),
      ...(body.gender !== undefined && { gender: body.gender }),
      ...(body.experience !== undefined && { experience: body.experience }),
      ...(body.companiesWorked !== undefined && { companiesWorked: body.companiesWorked }),
      ...(body.cvUrl !== undefined && { cvUrl: body.cvUrl }),
      ...(body.jobAppliedFor !== undefined && { jobAppliedFor: body.jobAppliedFor }),
    },
  })

  return ok(applicant)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(['ADMIN', 'MANAGER'])
  if (auth.error) return auth.error

  const { id } = await params

  const existing = await prisma.jobApplicant.findUnique({ where: { id } })
  if (!existing) return err('Applicant not found', 404)

  await prisma.jobApplicant.delete({ where: { id } })

  return ok({ message: 'Applicant deleted' })
}
