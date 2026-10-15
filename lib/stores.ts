import type { Server } from 'socket.io'

export interface FileData {
  id: string
  filename: string
  originalName: string
  size: number
  mimetype: string
  uploadedAt: number
}

const g = global as typeof globalThis & {
  __io?: Server
  __files?: Map<string, FileData>
}

if (!g.__files) g.__files = new Map()

export function getFilesStore(): Map<string, FileData> {
  return g.__files!
}

export function getIO(): Server | undefined {
  return g.__io
}
