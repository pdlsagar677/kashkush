import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { getFilesStore, getIO } from '@/lib/stores'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const store = getFilesStore()
  const file = store.get(id)

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const filepath = join(process.cwd(), 'public', 'uploads', file.filename)
  try {
    await unlink(filepath)
  } catch {
    // File may already be gone
  }

  store.delete(id)

  const io = getIO()
  if (io) io.emit('files:refresh')

  return NextResponse.json({ success: true })
}
