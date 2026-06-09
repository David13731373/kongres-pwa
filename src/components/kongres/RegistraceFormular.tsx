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
        setServerChyba(json.error ?? 'Registrace se nezdařila.')
        setStav('chyba')
      }
    } catch {
      setServerChyba('Registrace se nezdařila. Zkuste to prosím znovu.')
      setStav('chyba')
    }
  }

  if (stav === 'uspech') {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-green-900">Registrace přijata!</h3>
            <p className="text-sm text-green-700 mt-1">
              Brzy vás budeme kontaktovat s dalšími informacemi.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const FieldError = ({ field }: { field: string }) => {
    const errs = fieldErrors[field]
    if (!errs?.length) return null
    return <p className="text-red-500 text-xs mt-1.5">{errs[0]}</p>
  }

  const inputCls = (field: string) =>
    `w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors ${
      fieldErrors[field]?.length
        ? 'border-red-300 bg-red-50 focus:ring-red-500'
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5" htmlFor="jmeno">
            Jméno <span className="text-red-400">*</span>
          </label>
          <input id="jmeno" name="jmeno" required placeholder="Jana" className={inputCls('jmeno')} />
          <FieldError field="jmeno" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5" htmlFor="prijmeni">
            Příjmení <span className="text-red-400">*</span>
          </label>
          <input id="prijmeni" name="prijmeni" required placeholder="Nováková" className={inputCls('prijmeni')} />
          <FieldError field="prijmeni" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5" htmlFor="email">
          Email <span className="text-red-400">*</span>
        </label>
        <input
          id="email" name="email" type="email" required
          placeholder="jana@nemocnice.cz"
          className={inputCls('email')}
        />
        <FieldError field="email" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5" htmlFor="telefon">
            Telefon
          </label>
          <input
            id="telefon" name="telefon" type="tel"
            placeholder="+420 777 123 456"
            className={inputCls('telefon')}
          />
          <FieldError field="telefon" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5" htmlFor="organizace">
            Organizace
          </label>
          <input
            id="organizace" name="organizace"
            placeholder="FN Brno"
            className={inputCls('organizace')}
          />
          <FieldError field="organizace" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5" htmlFor="poznamka">
          Poznámka
        </label>
        <textarea
          id="poznamka" name="poznamka" rows={3}
          placeholder="Speciální požadavky, dotazy…"
          className={`${inputCls('poznamka')} resize-none`}
        />
        <FieldError field="poznamka" />
      </div>

      {serverChyba && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-red-600 text-sm">{serverChyba}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={stav === 'odesila'}
        className="w-full rounded-lg bg-gray-900 px-6 py-2.5 text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {stav === 'odesila' ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Odesílám…
          </span>
        ) : (
          'Zaregistrovat se'
        )}
      </button>
    </form>
  )
}
