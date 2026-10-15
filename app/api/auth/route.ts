import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password, nickname } = await request.json()
  const correct = process.env.ACCESS_PASSWORD

  if (!correct || password !== correct) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const safeName = String(nickname || 'Anonymous').trim().slice(0, 20)
  const maxAge = 60 * 60 * 24 * 7 // 7 days

  const res = NextResponse.json({ success: true })

  res.cookies.set('savr_auth', 'ok', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
  })

  // Not httpOnly so ClipboardSync can read it client-side
  res.cookies.set('savr_nickname', safeName, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
  })

  return res
}
