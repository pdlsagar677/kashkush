'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError('Incorrect password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-teal-600">simple.savr</h1>
          <p className="text-sm text-gray-500 mt-1">Enter the access password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                       focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500
                       transition-colors"
          />

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl bg-teal-600 text-white font-medium text-sm
                       hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
