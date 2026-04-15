import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  const file = await prisma.uploadedFile.findUnique({
    where: { filename },
  })

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const buffer = Buffer.from(file.data, 'base64')

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': file.mimeType,
      'Content-Length': String(buffer.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
