'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [heslo, setHeslo] = useState('')
  const [chyba, setChyba] = useState<string | null>(null)
  const [nacita, setNacita] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setNacita(true)
    setChyba(null)

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: heslo }),
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      const data = await res.json()
      setChyba(data.error ?? 'Přihlášení selhalo.')
      setNacita(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin přihlášení</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="heslo">
                Heslo
              </label>
              <input
                id="heslo"
                type="password"
                required
                value={heslo}
                onChange={(e) => setHeslo(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {chyba && <p className="text-sm text-red-600">{chyba}</p>}

            <button
              type="submit"
              disabled={nacita}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {nacita ? 'Přihlašuji...' : 'Přihlásit se'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
