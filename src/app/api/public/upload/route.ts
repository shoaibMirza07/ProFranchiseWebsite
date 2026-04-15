import { NextRequest } from 'next/server'
import { ok, err } from '@/lib/api-helpers'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return err('No file provided')

  const isAllowed = file.type.startsWith('image/') || file.type.startsWith('video/') ||
    file.type === 'application/pdf' ||
    file.type === 'application/msword' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (!isAllowed) return err('Only image, video, PDF and document files are allowed')

  // Limit public uploads to 10MB
  const maxSize = 10 * 1024 * 1024
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (buffer.length > maxSize) return err('File size exceeds 10MB limit')

  const base64Data = buffer.toString('base64')
  const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const timestamp = Date.now()
  const filename = `${timestamp}_${originalName}`

  try {
    await prisma.uploadedFile.create({
      data: {
        filename,
        mimeType: file.type,
        data: base64Data,
        size: buffer.length,
      },
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Database error'
    return err(`Failed to save file: ${msg}`, 500)
  }

  return ok({ url: `/api/files/${filename}` }, 201)
}
