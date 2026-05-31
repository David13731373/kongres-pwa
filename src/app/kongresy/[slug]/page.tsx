import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import RegistraceFormular from '@/components/kongres/RegistraceFormular'
import type { Database } from '@/types/database'

type KongresRow = Database['public']['Tables']['kongresy']['Row']
type ProgramRow = Database['public']['Tables']['program']['Row']
type KongresDetail = KongresRow & { program: ProgramRow[] }

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('kongresy')
    .select('nazev')
    .eq('slug', slug)
    .single()

  const kongres = data as Pick<KongresRow, 'nazev'> | null
  return { title: kongres?.nazev ?? 'Kongres' }
}

export default async function KongresDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('kongresy')
    .select('*, program(*)')
    .eq('slug', slug)
    .eq('aktivni', true)
    .single()

  if (error || !data) notFound()

  const kongres = data as unknown as KongresDetail

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-primary-700 mb-2">{kongres.nazev}</h1>

      <div className="text-gray-500 mb-6">
        <span>
          {new Date(kongres.datum_zacatek).toLocaleDateString('cs-CZ')}
          {kongres.datum_konec && ` – ${new Date(kongres.datum_konec).toLocaleDateString('cs-CZ')}`}
        </span>
        {kongres.misto && <span className="ml-4">📍 {kongres.misto}</span>}
      </div>

      {kongres.popis && (
        <div className="prose mb-8">
          <p>{kongres.popis}</p>
        </div>
      )}

      {kongres.program && kongres.program.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Program</h2>
          <div className="space-y-3">
            {kongres.program.map((item) => (
              <div key={item.id} className="flex gap-4 border-l-4 border-primary-500 pl-4 py-1">
                <span className="text-gray-400 w-24 shrink-0">{item.cas_od}</span>
                <div>
                  <p className="font-medium">{item.nazev}</p>
                  {item.priznak && <p className="text-gray-500 text-sm">{item.priznak}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">Registrace</h2>
        <RegistraceFormular kongresId={kongres.id} kongresSlug={slug} />
      </section>
    </main>
  )
}
