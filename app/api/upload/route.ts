import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { getFilesStore, getIO, type FileData } from '@/lib/stores'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const id = crypto.randomUUID()
  const ext = file.name.includes('.') ? file.name.split('.').pop() : ''
  const filename = ext ? `${id}.${ext}` : id
  const filepath = join(process.cwd(), 'public', 'uploads', filename)

  await writeFile(filepath, buffer)

  const fileData: FileData = {
    id: filename,
    filename,
    originalName: file.name,
    size: file.size,
    mimetype: file.type,
    uploadedAt: Date.now(),
  }

  getFilesStore().set(filename, fileData)

  const io = getIO()
  if (io) io.emit('files:refresh')

  return NextResponse.json(fileData)
}
