'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { getSocket } from '@/lib/socketClient'

interface FileItem {
  id: string
  filename: string
  originalName: string
  size: number
  mimetype: string
  uploadedAt: number
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function FileShare() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchFiles = useCallback(async () => {
    const res = await fetch('/api/files')
    const data = await res.json()
    setFiles(data.files ?? [])
  }, [])

  useEffect(() => {
    fetchFiles()
    const socket = getSocket()
    const onRefresh = () => fetchFiles()
    socket.on('files:refresh', onRefresh)
    return () => { socket.off('files:refresh', onRefresh) }
  }, [fetchFiles])

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true)
    setUploadProgress(0)
    const formData = new FormData()
    formData.append('file', file)

    return new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest()
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => {
        setUploading(false)
        setUploadProgress(0)
        fetchFiles()
        resolve()
      }
      xhr.onerror = () => { setUploading(false); resolve() }
      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    })
  }, [fetchFiles])

  const handleFiles = useCallback(async (fileList: FileList) => {
    for (const file of Array.from(fileList)) {
      await uploadFile(file)
    }
  }, [uploadFile])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files)
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/files/${id}`, { method: 'DELETE' })
    fetchFiles()
  }

  const handleDownload = (filename: string, originalName: string) => {
    const a = document.createElement('a')
    a.href = `/uploads/${filename}`
    a.download = originalName
    a.click()
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-800 mb-4">File Sharing</h2>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors mb-4
          ${dragging ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-teal-400 hover:bg-gray-50'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <p className="text-sm text-gray-500">
          {uploading
            ? `Uploading… ${uploadProgress}%`
            : 'Drop files here or click to browse'}
        </p>
        {uploading && (
          <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* File list */}
      {files.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No files shared yet. Upload one above.
        </p>
      ) : (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{f.originalName}</p>
                <p className="text-xs text-gray-400">
                  {formatSize(f.size)} · {new Date(f.uploadedAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleDownload(f.filename, f.originalName)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700
                             hover:bg-teal-100 font-medium transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500
                             hover:bg-red-100 font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
