'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import App from '../../App'
import { clearSession, loadSession } from '../../auth/session'

export default function BoardGate() {
  const router = useRouter()
  const session = useMemo(() => loadSession(), [])

  useEffect(() => {
    if (!session?.email) router.replace('/auth')
  }, [router, session])

  if (!session?.email) return null

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white px-6 py-3">
        <div className="mx-auto flex w-full max-w-[1480px] items-center justify-end gap-3">
          <p className="hidden text-xs text-slate-500 sm:block">
            Signed in as <span className="font-semibold">{session.email}</span>
          </p>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            onClick={() => {
              clearSession()
              router.push('/auth')
            }}
          >
            Sign out
          </button>
        </div>
      </header>

      <App />
    </div>
  )
}
