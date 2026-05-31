import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const MAX_CHUNK_SIZE = 3180
const COOKIE_NAME = 'sb-rztbxaymitqblatiolbj-auth-token'

function createChunks(key: string, value: string) {
  const enc = encodeURIComponent(value)
  if (enc.length <= MAX_CHUNK_SIZE) return [{ name: key, value }]
  const chunks: { name: string; value: string }[] = []
  let rem = enc; let i = 0
  while (rem.length > 0) {
    const slice = rem.slice(0, MAX_CHUNK_SIZE)
    chunks.push({ name: `${key}.${i}`, value: decodeURIComponent(slice) })
    rem = rem.slice(slice.length); i++
  }
  return chunks
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password } = body

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message }, { status: 401 })
  }

  const chunks = createChunks(COOKIE_NAME, JSON.stringify(data.session))
  const res = NextResponse.json({ success: true, chunks: chunks.length, user: data.user.email })

  const cookieOpts = { httpOnly: true, secure: true, sameSite: 'lax' as const, path: '/', maxAge: 60*60*24*7 }
  for (const chunk of chunks) {
    res.cookies.set(chunk.name, chunk.value, cookieOpts)
  }

  return res
}
