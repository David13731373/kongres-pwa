import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StavRegistrace from './StavRegistrace'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RegistracePage({ params }: Props) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: kongres } = await supabase
    .from('kongresy')
    .select('id, nazev, datum_zacatek')
    .eq('id', id)
    .single()

  if (!kongres) redirect('/admin')

  const { data: registrace } = await supabase
    .from('registrace')
    .select('*')
    .eq('kongres_id', id)
    .order('created_at', { ascending: false })

  const pocty = {
    cekajici: registrace?.filter(r => r.stav === 'cekajici').length ?? 0,
    potvrzena: registrace?.filter(r => r.stav === 'potvrzena').length ?? 0,
    zrusena: registrace?.filter(r => r.stav === 'zrusena').length ?? 0,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Zpět
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900">{kongres.nazev}</h1>
          <span className="text-sm text-gray-400 ml-2">
            {new Date(kongres.datum_zacatek).toLocaleDateString('cs-CZ')}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Souhrn */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{pocty.cekajici}</div>
            <div className="text-sm text-gray-500 mt-1">Čekající</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{pocty.potvrzena}</div>
            <div className="text-sm text-gray-500 mt-1">Potvrzeno</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{pocty.zrusena}</div>
            <div className="text-sm text-gray-500 mt-1">Zrušeno</div>
          </div>
        </div>

        {/* Tabulka */}
        {(!registrace || registrace.length === 0) ? (
          <p className="text-gray-500">Zatím žádné registrace.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Jméno</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Organizace</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Přihlášeno</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Stav</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registrace.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {r.jmeno} {r.prijmeni}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.email}</td>
                    <td className="px-4 py-3 text-gray-500">{r.organizace ?? '—'}</td>
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

function StavBadge({ stav }: { stav: string }) {
  const map: Record<string, string> = {
    cekajici: 'bg-yellow-100 text-yellow-700',
    potvrzena: 'bg-green-100 text-green-700',
    zrusena: 'bg-red-100 text-red-600',
  }
  const labels: Record<string, string> = {
    cekajici: 'Čekající',
    potvrzena: 'Potvrzena',
    zrusena: 'Zrušena',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[stav] ?? 'bg-gray-100 text-gray-500'}`}>
      {labels[stav] ?? stav}
    </span>
  )
}
