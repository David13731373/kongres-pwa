import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing env vars', url: !!url, key: !!key })
  }

  const supabase = createClient(url, key)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'dvhv@seznam.cz',
    password: 'Master31052026@'
  })

  return NextResponse.json({
    url_ok: url.includes('rztbxaymitqblatiolbj'),
    error: error ? { message: error.message, status: error.status } : null,
    user: data?.user ? { id: data.user.id, email: data.user.email } : null,
  })
}
