import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { poslatPotvrzeniUcasti, poslatZruseniRegistrace } from '@/lib/email'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: registrace, error: fetchError } = await supabase
    .from('registrace')
    .select('id, jmeno, prijmeni, email, kongres_id, kongresy(nazev)')
    .eq('id', id)
    .single()

  if (fetchError || !registrace) {
    return NextResponse.json({ error: 'Registrace nenalezena' }, { status: 404 })
  }

  const { error } = await supabase
    .from('registrace')
    .update({ stav })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const kongresNazev = (registrace.kongresy as { nazev: string } | null)?.nazev ?? 'kongres'
  const emailParams = {
    email: registrace.email,
    jmeno: registrace.jmeno,
    prijmeni: registrace.prijmeni,
    kongresNazev,
    registraceId: registrace.id,
  }

  if (stav === 'potvrzena') {
    poslatPotvrzeniUcasti(emailParams).catch((err) => console.error('Email chyba (potvrzeni):', err))
  } else if (stav === 'zrusena') {
    poslatZruseniRegistrace(emailParams).catch((err) => console.error('Email chyba (zruseni):', err))
  }

  return NextResponse.json({ success: true })
}
