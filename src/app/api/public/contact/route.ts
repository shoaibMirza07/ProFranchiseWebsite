import { NextRequest } from 'next/server'
import { ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { fullName, email, phone, inquiryType, company, message } = body

  if (!fullName || !email) return err('fullName and email are required')

  const lead = await prisma.lead.create({
    data: {
      fullName,
      email,
      phone: phone ?? '',
      inquiryType: inquiryType ?? 'GENERAL',
      company: company ?? '',
      message: message ?? '',
      source: 'website',
      stage: 'NEW',
      priority: 'MEDIUM',
    },
  })

  return ok({ success: true, id: lead.id }, 201)
}
