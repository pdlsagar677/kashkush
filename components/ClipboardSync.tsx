'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { getSocket } from '@/lib/socketClient'

function getNickname(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(/(?:^|;\s*)savr_nickname=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

function typingText(users: string[]): string {
  if (users.length === 0) return ''
  if (users.length === 1) return `${users[0]} is typing…`
  if (users.length === 2) return `${users[0]} and ${users[1]} are typing…`
  return `${users[0]} and ${users.length - 1} others are typing…`
}

export default function ClipboardSync() {
  const [text, setText] = useState('')
  const [connected, setConnected] = useState(false)
  const [copied, setCopied] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [onlineCount, setOnlineCount] = useState(0)

  const isFocusedRef = useRef(false)
  const pendingRef = useRef<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const socket = getSocket()
    const nickname = getNickname()

    const onConnect = () => {
      setConnected(true)
      if (nickname) socket.emit('user:join', nickname)
    }
    const onDisconnect = () => setConnected(false)
    const onInit = (val: string) => setText(val)
    const onUpdate = (val: string) => {
      if (isFocusedRef.current) {
        pendingRef.current = val
      } else {
        setText(val)
      }
    }
    const onTypingUpdate = ({ nickname: name, isTyping }: { nickname: string; isTyping: boolean }) => {
      setTypingUsers(prev =>
        isTyping
          ? [...prev.filter(n => n !== name), name]
          : prev.filter(n => n !== name)
      )
    }
    const onUsersUpdate = (users: string[]) => setOnlineCount(users.length)

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('clipboard:init', onInit)
    socket.on('clipboard:update', onUpdate)
    socket.on('typing:update', onTypingUpdate)
    socket.on('users:update', onUsersUpdate)

    if (socket.connected) onConnect()

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('clipboard:init', onInit)
      socket.off('clipboard:update', onUpdate)
      socket.off('typing:update', onTypingUpdate)
      socket.off('users:update', onUsersUpdate)
    }
  }, [])

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setText(val)

    // Clipboard sync (debounced)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      getSocket().emit('clipboard:update', val)
    }, 200)

    // Typing presence
    if (!isTypingRef.current) {
      isTypingRef.current = true
      getSocket().emit('typing:start')
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false
      getSocket().emit('typing:stop')
    }, 2000)
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
            {connected ? 'Live' : 'Connecting…'}
          </span>
          {onlineCount > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {onlineCount} online
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400">{text.length} chars</span>
      </div>

      <textarea
        className="w-full min-h-64 border border-gray-200 rounded-xl p-4 text-sm font-mono
                   resize-y focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500
                   transition-colors placeholder:text-gray-300"
        placeholder="Start typing — syncs to all devices instantly…"
        value={text}
        onChange={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      {/* Typing indicator */}
      <div className="h-5 mt-1">
        {typingUsers.length > 0 && (
          <p className="text-xs text-gray-400 italic">{typingText(typingUsers)}</p>
        )}
      </div>

      <div className="flex gap-2 mt-2">
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
