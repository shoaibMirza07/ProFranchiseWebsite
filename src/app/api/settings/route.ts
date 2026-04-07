import { NextRequest } from 'next/server'
import { requireAuth, ok } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const settings = await prisma.setting.findMany()

  const grouped: Record<string, Record<string, string>> = {}
  for (const s of settings) {
    if (!grouped[s.group]) grouped[s.group] = {}
    grouped[s.group][s.key] = s.value
  }

  return ok(grouped)
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  const items: { key: string; value: string; group?: string }[] = Array.isArray(body) ? body : [body]

  const results = await Promise.all(
    items.map((item) =>
      prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value, group: item.group ?? 'general' },
        create: { key: item.key, value: item.value, group: item.group ?? 'general' },
      })
    )
  )

  return ok(results)
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const body = await req.json()
  const items: { key: string; value: string; group?: string }[] = Array.isArray(body) ? body : [body]

  const results = await Promise.all(
    items.map((item) =>
      prisma.setting.upsert({
        where: { key: item.key },
        update: { value: item.value, group: item.group ?? 'general' },
        create: { key: item.key, value: item.value, group: item.group ?? 'general' },
      })
    )
  )

  return ok(results)
}
