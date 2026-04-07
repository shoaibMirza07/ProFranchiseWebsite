import { NextRequest } from 'next/server'
import { requireAuth, ok, err } from '@/lib/api-helpers'
import fs from 'fs'
import path from 'path'

export async function POST(req: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return err('No file provided')

  const isAllowed = file.type.startsWith('image/') || file.type.startsWith('video/')
  if (!isAllowed) return err('Only image and video files are allowed')

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const timestamp = Date.now()
  const filename = `${timestamp}_${originalName}`

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    const filePath = path.join(uploadsDir, filename)
    fs.writeFileSync(filePath, buffer)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Filesystem error'
    return err(`Failed to save file: ${msg}`, 500)
  }

  return ok({ url: `/uploads/${filename}` }, 201)
}
