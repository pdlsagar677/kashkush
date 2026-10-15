import { NextResponse } from 'next/server'
import { getFilesStore } from '@/lib/stores'

export async function GET() {
  const files = Array.from(getFilesStore().values()).sort((a, b) => b.uploadedAt - a.uploadedAt)
  return NextResponse.json({ files })
}
