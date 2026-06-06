import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { registraceSchema } from '@/lib/validace'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = registraceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Neplatna data' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !anonKey || !serviceKey) {
      return NextResponse.json(
        { error: 'Chybi Supabase konfigurace', url: !!url, anonKey: !!anonKey, serviceKey: !!serviceKey },
        { status: 500 }
      )
    }

    const supabaseAnon = createClient(url, anonKey)

    const { data: kongres, error: kongresError } = await supabaseAnon
      .from('kongresy')
      .select('id, nazev, registrace_otevrena')
      .eq('id', parsed.data.kongres_id)
      .single()

    if (kongresError) {
      return NextResponse.json({ error: 'Kongres nenalezen.' }, { status: 404 })
    }

    if (!kongres.registrace_otevrena) {
      return NextResponse.json({ error: 'Registrace na tento kongres jsou uzavreny.' }, { status: 400 })
    }

    const supabaseAdmin = createClient(url, serviceKey)

    const { data: registrace, error: regError } = await supabaseAdmin
      .from('registrace')
      .insert({
        kongres_id: parsed.data.kongres_id,
        jmeno: parsed.data.jmeno,
        prijmeni: parsed.data.prijmeni,
        email: parsed.data.email,
        telefon: parsed.data.telefon ?? null,
        organizace: parsed.data.organizace ?? null,
        poznamka: parsed.data.poznamka ?? null,
        stav: 'cekajici',
      })
      .select()
      .single()

    if (regError) {
      // Duplicitni email na tento kongres
      if (regError.code === '23505') {
        return NextResponse.json(
          { error: 'Na tento kongres jste jiz zaregistrovani. Kazdy ucastnik se muze registrovat pouze jednou.' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: 'Registraci se nepodarilo ulozit. Zkuste to prosim znovu.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: registrace.id }, { status: 201 })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'Neocekavana chyba: ' + message }, { status: 500 })
  }
}
