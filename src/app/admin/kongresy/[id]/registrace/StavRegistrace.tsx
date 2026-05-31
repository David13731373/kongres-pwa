'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  id: string
  stavNyni: 'cekajici' | 'potvrzena' | 'zrusena'
}

export default function StavRegistrace({ id, stavNyni }: Props) {
  const router = useRouter()
  const [nacita, setNacita] = useState(false)

  async function zmenStav(novyStav: 'potvrzena' | 'zrusena') {
    if (nacita) return
    setNacita(true)

    await fetch(`/api/admin/registrace/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stav: novyStav }),
    })

    router.refresh()
    setNacita(false)
  }

  if (stavNyni === 'potvrzena') {
    return (
      <button
        onClick={() => zmenStav('zrusena')}
        disabled={nacita}
        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
      >
        Zrušit
      </button>
    )
  }

  if (stavNyni === 'zrusena') {
    return (
      <button
        onClick={() => zmenStav('potvrzena')}
        disabled={nacita}
        className="text-xs text-green-600 hover:text-green-800 disabled:opacity-40"
      >
        Potvrdit
      </button>
    )
  }

  // cekajici — zobraz obě akce
  return (
    <div className="flex gap-3">
      <button
        onClick={() => zmenStav('potvrzena')}
        disabled={nacita}
        className="text-xs text-green-600 hover:text-green-800 font-medium disabled:opacity-40"
      >
        Potvrdit
      </button>
      <button
        onClick={() => zmenStav('zrusena')}
        disabled={nacita}
        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40"
      >
        Zrušit
      </button>
    </div>
  )
}
