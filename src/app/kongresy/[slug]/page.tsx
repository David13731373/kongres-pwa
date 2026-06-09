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

  const datumZacatek = new Date(kongres.datum_zacatek).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  const datumKonec = kongres.datum_konec
    ? new Date(kongres.datum_konec).toLocaleDateString('cs-CZ', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : null

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* Hlavicka kongresu */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">{kongres.nazev}</h1>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600">
              <CalendarIcon />
              <span>
                {datumZacatek}
                {datumKonec && <> &ndash; {datumKonec}</>}
              </span>
            </div>
            {kongres.misto && (
              <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600">
                <LocationIcon />
                <span>{kongres.misto}</span>
              </div>
            )}
          </div>
        </div>

        {/* Popis */}
        {kongres.popis && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <p className="text-gray-600 leading-relaxed">{kongres.popis}</p>
          </div>
        )}

        {/* Program */}
        {kongres.program && kongres.program.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Program</h2>
            <div className="space-y-0">
              {kongres.program.map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex gap-4 py-3 ${idx < kongres.program.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className="text-sm text-gray-400 w-16 shrink-0 pt-0.5 font-mono">
                    {item.cas_od}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.nazev}</p>
                    {item.priznak && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.priznak}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Registrace */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Registrace</h2>
          <p className="text-sm text-gray-500 mb-6">
            Vyplňte formulář a potvrdíme vám účast emailem.
          </p>
          <RegistraceFormular kongresId={kongres.id} kongresSlug={slug} />
        </div>

      </main>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}
