import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password } = body

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cookiesToSet: { name: string; value: string; options?: any }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setAll(cookies: any[]) {
          cookies.forEach((c: any) => cookiesToSet.push(c))
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message ?? 'Login failed' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true, user: data.user.email })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cookiesToSet.forEach(({ name, value, options }: any) =>
    res.cookies.set(name, value, options)
  )

  return res
}
