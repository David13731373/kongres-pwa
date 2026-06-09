import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StavRegistrace from './StavRegistrace'
import type { Database } from '@/types/database'

type RegistraceRow = Database['public']['Tables']['registrace']['Row']
type KongresRow = Database['public']['Tables']['kongresy']['Row']

interface Props {
  params: Promise<{ id: string }>
}

export default async function RegistracePage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: kongresData } = await supabase
    .from('kongresy')
    .select('id, nazev, datum_zacatek')
    .eq('id', id)
    .single()

  const kongres = kongresData as Pick<KongresRow, 'id' | 'nazev' | 'datum_zacatek'> | null
  if (!kongres) redirect('/admin')

  const { data: registraceData } = await supabase
    .from('registrace')
    .select('*')
    .eq('kongres_id', id)
    .order('created_at', { ascending: false })

  const registrace = (registraceData ?? []) as RegistraceRow[]

  const pocty = {
    cekajici: registrace.filter(r => r.stav === 'cekajici').length,
    potvrzena: registrace.filter(r => r.stav === 'potvrzena').length,
    zrusena: registrace.filter(r => r.stav === 'zrusena').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center gap-2.5">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Zpět
          </Link>
          <span className="text-gray-300 text-lg">/</span>
          <h1 className="text-base font-semibold text-gray-900">{kongres.nazev}</h1>
          <span className="text-sm text-gray-400 ml-1">
            {new Date(kongres.datum_zacatek).toLocaleDateString('cs-CZ', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={<ClockIcon />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            count={pocty.cekajici}
            label="Čekající"
          />
          <StatCard
            icon={<CheckIcon />}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            count={pocty.potvrzena}
            label="Potvrzeno"
          />
          <StatCard
            icon={<XIcon />}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            count={pocty.zrusena}
            label="Zrušeno"
          />
        </div>

        {registrace.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm">Zatím žádné registrace.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500" style={{ width: '20%' }}>Jméno</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500" style={{ width: '22%' }}>Kontakt</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500" style={{ width: '16%' }}>Organizace</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500" style={{ width: '18%' }}>Poznámka</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500" style={{ width: '12%' }}>Přihlášeno</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500" style={{ width: '7%' }}>Stav</th>
                  <th className="px-4 py-3" style={{ width: '5%' }}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrace.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">{r.jmeno} {r.prijmeni}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-700 text-xs truncate">{r.email}</div>
                      {r.telefon && (
                        <div className="text-gray-400 text-xs mt-0.5">{r.telefon}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs truncate">
                      {r.organizace ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {r.poznamka ? (
                        <span className="line-clamp-2" title={r.poznamka}>{r.poznamka}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(r.created_at).toLocaleString('cs-CZ', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <StavBadge stav={r.stav} />
                    </td>
                    <td className="px-4 py-3">
                      <StavRegistrace id={r.id} stavNyni={r.stav} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

function StatCard({
  icon, iconBg, iconColor, count, label
}: {
  icon: React.ReactNode
  iconBg: string
  iconColor: string
  count: number
  label: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-semibold text-gray-900 leading-none">{count}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    </div>
  )
}

function StavBadge({ stav }: { stav: string }) {
  const styles: Record<string, string> = {
    cekajici: 'bg-amber-50 text-amber-700 ring-amber-200',
    potvrzena: 'bg-green-50 text-green-700 ring-green-200',
    zrusena: 'bg-red-50 text-red-600 ring-red-200',
  }
  const labels: Record<string, string> = {
    cekajici: 'Čekající',
    potvrzena: 'Potvrzeno',
    zrusena: 'Zrušeno',
  }
  const dots: Record<string, string> = {
    cekajici: 'bg-amber-400',
    potvrzena: 'bg-green-500',
    zrusena: 'bg-red-400',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${styles[stav] ?? 'bg-gray-100 text-gray-500 ring-gray-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dots[stav] ?? 'bg-gray-400'}`} />
      {labels[stav] ?? stav}
    </span>
  )
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
