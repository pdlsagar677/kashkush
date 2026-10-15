'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { getSocket } from '@/lib/socketClient'

export default function ClipboardSync() {
  const [text, setText] = useState('')
  const [connected, setConnected] = useState(false)
  const [copied, setCopied] = useState(false)
  const isFocusedRef = useRef(false)
  const pendingRef = useRef<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const socket = getSocket()

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    const onInit = (val: string) => setText(val)
    const onUpdate = (val: string) => {
      if (isFocusedRef.current) {
        pendingRef.current = val
      } else {
        setText(val)
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('clipboard:init', onInit)
    socket.on('clipboard:update', onUpdate)

    if (socket.connected) setConnected(true)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('clipboard:init', onInit)
      socket.off('clipboard:update', onUpdate)
    }
  }, [])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setText(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      getSocket().emit('clipboard:update', val)
    }, 200)
  }, [])

  const handleFocus = () => { isFocusedRef.current = true }

  const handleBlur = () => {
    isFocusedRef.current = false
    if (pendingRef.current !== null) {
      setText(pendingRef.current)
      pendingRef.current = null
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleClear = () => {
    setText('')
    getSocket().emit('clipboard:update', '')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-500">
            {connected ? 'Live — syncing across devices' : 'Connecting…'}
          </span>
        </div>
        <span className="text-xs text-gray-400">{text.length} chars</span>
      </div>

      <textarea
        className="w-full min-h-64 border border-gray-200 rounded-xl p-4 text-sm font-mono
                   resize-y focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500
                   transition-colors placeholder:text-gray-300"
        placeholder="Start typing — syncs to all devices on your network instantly…"
        value={text}
        onChange={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleCopy}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200
                     hover:border-teal-500 hover:text-teal-600 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200
                     hover:border-red-300 hover:text-red-500 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
