'use server'

import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const CHUNK_SIZE = 3180
const COOKIE_NAME = 'sb-rztbxaymitqblatiolbj-auth-token'

function createChunks(key: string, value: string): { name: string; value: string }[] {
  const encodedValue = encodeURIComponent(value)
  if (encodedValue.length <= CHUNK_SIZE) {
    return [{ name: key, value }]
  }
  const chunks: { name: string; value: string }[] = []
  let remaining = encodedValue
  let i = 0
  while (remaining.length > 0) {
    const chunk = remaining.slice(0, CHUNK_SIZE)
    try {
      chunks.push({ name: `${key}.${i}`, value: decodeURIComponent(chunk) })
    } catch {
      chunks.push({ name: `${key}.${i}`, value: chunk })
    }
    remaining = remaining.slice(chunk.length)
    i++
  }
  return chunks
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('heslo') as string

  if (!email || !password) {
    redirect(`/admin/login?error=${encodeURIComponent('Vyplňte email a heslo')}`)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    redirect(`/admin/login?error=${encodeURIComponent(error?.message ?? 'Přihlášení selhalo')}`)
  }

  const sessionJson = JSON.stringify(data.session)
  const chunks = createChunks(COOKIE_NAME, sessionJson)

  const cookieStore = await cookies()
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  }

  for (const chunk of chunks) {
    cookieStore.set(chunk.name, chunk.value, cookieOptions)
  }

  redirect('/admin')
}
