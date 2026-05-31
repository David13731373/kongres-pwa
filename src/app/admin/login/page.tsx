import { loginAction } from './actions'

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin přihlášení</h1>

          <form action={loginAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="heslo">
                Heslo
              </label>
              <input
                id="heslo"
                name="heslo"
                type="password"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">Chyba: {decodeURIComponent(error)}</p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Přihlásit se
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
