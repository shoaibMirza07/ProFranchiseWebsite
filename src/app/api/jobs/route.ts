import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await requireAuth(['ADMIN', 'MANAGER'])
  if (auth.error) return auth.error

  const { searchParams } = new URL(req.url)
  const gender = searchParams.get('gender')
  const nationality = searchParams.get('nationality')
  const status = searchParams.get('status')
  const q = searchParams.get('q')

  const applicants = await prisma.jobApplicant.findMany({
    where: {
      ...(gender && { gender }),
      ...(nationality && { nationality: { contains: nationality } }),
      ...(status && { status }),
      ...(q && {
        OR: [
          { fullName: { contains: q } },
          { companiesWorked: { contains: q } },
          { experience: { contains: q } },
          { jobAppliedFor: { contains: q } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  })

  return ok(applicants)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    fullName, email, phone, nationality, gender,
    experience, companiesWorked, cvUrl, jobAppliedFor,
  } = body

  if (!fullName || !email) return err('fullName and email are required')

  const applicant = await prisma.jobApplicant.create({
    data: {
      fullName,
      email,
      phone: phone ?? '',
      nationality: nationality ?? '',
      gender: gender ?? 'UNSPECIFIED',
      experience: experience ?? '',
      companiesWorked: companiesWorked ?? '',
      cvUrl: cvUrl ?? null,
      jobAppliedFor: jobAppliedFor ?? '',
    },
  })

  return ok(applicant, 201)
}
