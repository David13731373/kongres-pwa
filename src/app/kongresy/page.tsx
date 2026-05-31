import { createServerClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Database } from '@/types/database'

type KongresRow = Database['public']['Tables']['kongresy']['Row']

export const metadata: Metadata = { title: 'Kongresy' }

export default async function KongressyPage() {
  const supabase = await createServerClient()

  const { data: kongresyData, error } = await supabase
    .from('kongresy')
    .select('id, nazev, slug, datum_zacatek, datum_konec, misto')
    .eq('aktivni', true)
    .order('datum_zacatek', { ascending: true })

  if (error) console.error('Chyba při načítání kongresů:', error)

  const kongresy = (kongresyData ?? []) as Pick<KongresRow, 'id' | 'nazev' | 'slug' | 'datum_zacatek' | 'datum_konec' | 'misto'>[]

  return (
    <main className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Nadcházející kongresy</h1>
      {kongresy.length === 0 ? (
        <p className="text-gray-500">Momentálně nejsou vypsány žádné kongresy.</p>
      ) : (
        <div className="grid gap-4">
          {kongresy.map((kongres) => (
            <Link
              key={kongres.id}
              href={`/kongresy/${kongres.slug}`}
              className="block rounded-xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-primary-700">{kongres.nazev}</h2>
              <p className="text-gray-500 mt-1">
                {new Date(kongres.datum_zacatek).toLocaleDateString('cs-CZ')}
                {kongres.datum_konec && ` – ${new Date(kongres.datum_konec).toLocaleDateString('cs-CZ')}`}
              </p>
              {kongres.misto && <p className="text-gray-600 mt-1">{kongres.misto}</p>}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
