import { prisma } from '@/lib/prisma'
import { ok } from '@/lib/api-helpers'

export async function GET() {
  const settings = await prisma.setting.findMany()

  const flat: Record<string, string> = {}
  for (const s of settings) {
    flat[s.key] = s.value
  }

  return ok(flat)
}
