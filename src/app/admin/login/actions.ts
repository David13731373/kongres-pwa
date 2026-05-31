'use server'

import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('heslo') as string

  console.log('[loginAction] email:', email, 'password length:', password?.length)

  if (!email || !password) {
    console.log('[loginAction] EMPTY FIELDS')
    redirect(`/admin/login?error=${encodeURIComponent('Vyplňte email a heslo')}`)
  }

  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  console.log('[loginAction] error:', error?.message ?? 'none')

  if (error) {
    redirect(`/admin/login?error=${encodeURIComponent(error.message)}`)
  }

  console.log('[loginAction] redirecting to /admin')
  redirect('/admin')
}
