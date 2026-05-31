'use client'

import { useState } from 'react'
import { registraceSchema, type RegistraceInput } from '@/lib/validace'

interface Props {
  kongresId: string
  kongresSlug: string
}

export default function RegistraceFormular({ kongresId }: Props) {
  const [stav, setStav] = useState<'idle' | 'odesila' | 'uspech' | 'chyba'>('idle')
  const [chybova, setChybova] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStav('odesila')
    setChybova(null)

    const formData = new FormData(e.currentTarget)
    const data: RegistraceInput = {
      kongres_id: kongresId,
      jmeno: formData.get('jmeno') as string,
      prijmeni: formData.get('prijmeni') as string,
      email: formData.get('email') as string,
      telefon: formData.get('telefon') as string || undefined,
      organizace: formData.get('organizace') as string || undefined,
      poznamka: formData.get('poznamka') as string || undefined,
    }

    const validated = registraceSchema.safeParse(data)
    if (!validated.success) {
      setChybova('Zkontrolujte prosím vyplněné údaje.')
      setStav('chyba')
      return
    }

    try {
      const res = await fetch('/api/registrace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated.data),
      })

      if (res.ok) {
        setStav('uspech')
      } else {
        const json = await res.json()
        setChybova(json.error ?? 'Registrace se nezdařila.')
        setStav('chyba')
      }
    } catch (err: any) {
      setChybova('Chyba: ' + (err?.message ?? JSON.stringify(err)))
      setStav('chyba')
    }
  }

  if (stav === 'uspech') {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-green-800">
        <h3 className="font-semibold text-lg">Registrace přijata! ✓</h3>
        <p className="mt-1">Na váš email jsme odeslali potvrzení.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="jmeno">Jméno *</label>
          <input id="jmeno" name="jmeno" required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="prijmeni">Příjmení *</label>
          <input id="prijmeni" name="prijmeni" required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="email">Email *</label>
        <input id="email" name="email" type="email" required className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="telefon">Telefon</label>
        <input id="telefon" name="telefon" type="tel" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="organizace">Organizace / Pracoviště</label>
        <input id="organizace" name="organizace" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="poznamka">Poznámka</label>
        <textarea id="poznamka" name="poznamka" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      {chybova && (
        <p className="text-red-600 text-sm">{chybova}</p>
      )}

      <button
        type="submit"
        disabled={stav === 'odesila'}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {stav === 'odesila' ? 'Odesílám...' : 'Zaregistrovat se'}
      </button>
    </form>
  )
}
