import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Ověření session přes server client
  const { createServerClient } = await import('@/lib/supabase/server')
  const supabaseAuth = await createServerClient()
  const { data: { user } } = await supabaseAuth.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Neprihlaseni' }, { status: 401 })
  }

  const body = await request.json()
  const { stav } = body

  const platneStavy = ['potvrzena', 'zrusena', 'cekajici']
  if (!platneStavy.includes(stav)) {
    return NextResponse.json({ error: 'Neplatny stav' }, { status: 400 })
  }

  // Update přes service role client (obchází RLS i typové problémy)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase
    .from('registrace')
    .update({ stav })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
