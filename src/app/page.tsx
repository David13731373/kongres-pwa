import Link from 'next/link'

// Úvodní stránka — přesměruje na seznam kongresů nebo login
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-primary-700 mb-4">
        Kongresová Aplikace
      </h1>
      <p className="text-gray-600 mb-8">Vyberte kongres nebo se přihlaste jako administrátor.</p>
      <div className="flex gap-4">
        <Link
          href="/kongresy"
          className="rounded-lg bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-700 transition-colors"
        >
          Zobrazit kongresy
        </Link>
        <Link
          href="/admin"
          className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
        >
          Admin
        </Link>
      </div>
    </main>
  )
}
