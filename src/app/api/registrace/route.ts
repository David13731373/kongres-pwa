import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { registraceSchema } from '@/lib/validace'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = registraceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Neplatná data' }, { status: 400 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      return NextResponse.json({ error: 'Chybí Supabase konfigurace', url: !!url, key: !!key }, { status: 500 })
    }

    const supabase = createClient(url, key)


    const { data: kongres, error: kongresError } = await supabase
      .from('kongresy')
      .select('id, nazev, registrace_otevrena')
      .eq('id', parsed.data.kongres_id)
      .single()

    if (kongresError) {
      return NextResponse.json({ error: 'Kongres error: ' + kongresError.message }, { status: 404 })
    }

    if (!kongres.registrace_otevrena) {
      return NextResponse.json({ error: 'Registrace jsou uzavřeny' }, { status: 400 })
    }

    const { data: registrace, error: regError } = await supabase
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
      return NextResponse.json({ error: 'Insert error: ' + regError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: registrace.id }, { status: 201 })

  } catch (err: any) {
    return NextResponse.json({ error: 'Crash: ' + err?.message }, { status: 500 })
  }
}
