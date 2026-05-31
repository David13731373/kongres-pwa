import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import type { Database } from '@/types/database'

type KongresRow = Database['public']['Tables']['kongresy']['Row']

export default async function AdminDashboard() {
  const supabase = await createServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: kongresyData } = await supabase
    .from('kongresy')
    .select('id, nazev, datum_zacatek, aktivni, registrace_otevrena')
    .order('datum_zacatek', { ascending: false })

  const kongresy = (kongresyData ?? []) as Pick<KongresRow, 'id' | 'nazev' | 'datum_zacatek' | 'aktivni' | 'registrace_otevrena'>[]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Admin — Kongresy</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {kongresy.length === 0 ? (
          <p className="text-gray-500">Žádné kongresy v databázi.</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Název</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Datum</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Stav</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {kongresy.map((k) => (
                  <tr key={k.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{k.nazev}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(k.datum_zacatek).toLocaleDateString('cs-CZ')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${k.aktivni ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {k.aktivni ? 'Aktivní' : 'Neaktivní'}
                      </span>
                      {k.registrace_otevrena && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          Reg. otevřena
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/kongresy/${k.id}/registrace`} className="text-blue-600 hover:text-blue-800 font-medium">
                        Registrace →
                      </Link>
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
