import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Neprihlaseni' }, { status: 401 })
  }

  const body = await request.json()
  const { stav } = body

  if (!['potvrzena', 'zrusena', 'cekajici'].includes(stav)) {
    return NextResponse.json({ error: 'Neplatny stav' }, { status: 400 })
  }

  const { error } = await supabase
    .from('registrace')
    .update({ stav: stav as 'cekajici' | 'potvrzena' | 'zrusena' })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
