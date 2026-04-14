import { NextRequest } from 'next/server'
import { ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

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
      heardAboutUs: body.heardAboutUs ?? '',
      cvUrl: cvUrl ?? null,
      jobAppliedFor: jobAppliedFor ?? '',
    },
  })

  return ok({ success: true, id: applicant.id }, 201)
}
