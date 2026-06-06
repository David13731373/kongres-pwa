'use client'

import { useState } from 'react'
import { registraceSchema } from '@/lib/validace'

interface Props {
  kongresId: string
  kongresSlug: string
}

type FieldErrors = Partial<Record<string, string[]>>

export default function RegistraceFormular({ kongresId }: Props) {
  const [stav, setStav] = useState<'idle' | 'odesila' | 'uspech' | 'chyba'>('idle')
  const [serverChyba, setServerChyba] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStav('odesila')
    setServerChyba(null)
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const raw = {
      kongres_id: kongresId,
      jmeno: formData.get('jmeno') as string,
      prijmeni: formData.get('prijmeni') as string,
      email: formData.get('email') as string,
      telefon: formData.get('telefon') as string || undefined,
      organizace: formData.get('organizace') as string || undefined,
      poznamka: formData.get('poznamka') as string || undefined,
    }

    const validated = registraceSchema.safeParse(raw)
    if (!validated.success) {
      setFieldErrors(validated.error.flatten().fieldErrors as FieldErrors)
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
        setServerChyba(json.error ?? 'Registrace se nepodarila.')
        setStav('chyba')
      }
    } catch {
      setServerChyba('Registrace se nepodarila. Zkuste to prosim znovu.')
      setStav('chyba')
    }
  }

  if (stav === 'uspech') {
    return (
      <div className="rounded-lg bg-green-50 border border-green-200 p-6 text-green-800">
        <h3 className="font-semibold text-lg">Registrace prijata!</h3>
        <p className="mt-1">Brzy vas budeme kontaktovat s dalsimi informacemi.</p>
      </div>
    )
  }

  const FieldError = ({ field }: { field: string }) => {
    const errs = fieldErrors[field]
    if (!errs?.length) return null
    return <p className="text-red-600 text-sm mt-1">{errs[0]}</p>
  }

  const inputCls = (field: string) =>
    `w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
      fieldErrors[field]?.length ? 'border-red-400' : 'border-gray-300'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="jmeno">
            Jmeno <span className="text-red-500">*</span>
          </label>
          <input id="jmeno" name="jmeno" required className={inputCls('jmeno')} />
          <FieldError field="jmeno" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="prijmeni">
            Prijmeni <span className="text-red-500">*</span>
          </label>
          <input id="prijmeni" name="prijmeni" required className={inputCls('prijmeni')} />
          <FieldError field="prijmeni" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="email">
          Email <span className="text-red-500">*</span>
        </label>
        <input id="email" name="email" type="email" required className={inputCls('email')} />
        <FieldError field="email" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="telefon">
          Telefon
        </label>
        <input id="telefon" name="telefon" type="tel" placeholder="+420 777 123 456" className={inputCls('telefon')} />
        <FieldError field="telefon" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="organizace">
          Organizace / Pracoviste
        </label>
        <input id="organizace" name="organizace" className={inputCls('organizace')} />
        <FieldError field="organizace" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="poznamka">
          Poznamka
        </label>
        <textarea id="poznamka" name="poznamka" rows={3} className={inputCls('poznamka')} />
        <FieldError field="poznamka" />
      </div>

      {serverChyba && (
        <p className="text-red-600 text-sm">{serverChyba}</p>
      )}

      <button
        type="submit"
        disabled={stav === 'odesila'}
        className="w-full rounded-lg bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {stav === 'odesila' ? 'Odesílam...' : 'Zaregistrovat se'}
      </button>
    </form>
  )
}
