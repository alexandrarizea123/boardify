'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import App from '../../App'
import { requestJson } from '../../api/requestJson'

export default function BoardGate() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadMe = async () => {
      try {
        const result = await requestJson('/api/auth/me')
        if (!isMounted) return
        setUser(result?.user ?? null)
      } catch {
        if (isMounted) router.replace('/auth')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadMe()

    return () => {
      isMounted = false
    }
  }, [router])

  if (isLoading) return null
  if (!user?.email) return null

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-100 bg-white px-6 py-3">
        <div className="mx-auto flex w-full max-w-[1480px] items-center justify-end gap-3">
          <p className="hidden text-xs text-slate-500 sm:block">
            Signed in as <span className="font-semibold">{user.email}</span>
          </p>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
            onClick={async () => {
              try {
                await requestJson('/api/auth/logout', { method: 'POST' })
              } finally {
                router.push('/auth')
              }
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
