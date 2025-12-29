'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearSession, loadSession, saveSession } from '../../auth/session'

const emailLooksValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const session = useMemo(() => loadSession(), [])

  useEffect(() => {
    if (session?.email) router.replace('/board')
  }, [router, session])

  const resetError = () => setError('')

  const handleSubmit = (event) => {
    event.preventDefault()
    resetError()

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()

    if (!trimmedEmail || !emailLooksValid(trimmedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (mode === 'signup') {
      if (!trimmedName) {
        setError('Enter your name.')
        return
      }
      if (password !== confirmPassword) {
        setError("Passwords don't match.")
        return
      }
    }

    saveSession({
      email: trimmedEmail,
      name: mode === 'signup' ? trimmedName : null,
      createdAt: new Date().toISOString(),
    })

    router.push('/board')
  }

  const handleModeChange = (nextMode) => {
    if (nextMode === mode) return
    setMode(nextMode)
    resetError()
    setPassword('')
    setConfirmPassword('')
  }

  const handleContinue = () => router.push('/board')

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/favicon.ico"
              alt="Boardify"
              className="h-10 w-10 rounded-2xl border border-slate-100 bg-white shadow-sm"
            />
            <div>
              <h1 className="text-lg font-semibold leading-tight">Boardify</h1>
              <p className="text-xs text-slate-500">
                Sign in to manage your boards.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            onClick={handleContinue}
          >
            Continue
          </button>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              className={[
                'flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition',
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900',
              ].join(' ')}
              onClick={() => handleModeChange('login')}
            >
              Log in
            </button>
            <button
              type="button"
              className={[
                'flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition',
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900',
              ].join(' ')}
              onClick={() => handleModeChange('signup')}
            >
              Sign up
            </button>
          </div>

          <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-700">Name</span>
                <input
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-700">Email</span>
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                inputMode="email"
                required
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-700">
                Password
              </span>
              <input
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
              />
              <p className="text-[11px] text-slate-500">
                Use at least 8 characters.
              </p>
            </label>

            {mode === 'signup' && (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-700">
                  Confirm password
                </span>
                <input
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </label>
            )}

            {error && (
              <div
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {mode === 'signup' ? 'Create account' : 'Log in'}
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              onClick={() => {
                clearSession()
                resetError()
                setName('')
                setEmail('')
                setPassword('')
                setConfirmPassword('')
              }}
            >
              Clear saved session
            </button>
          </form>
        </section>

        <p className="text-center text-[11px] text-slate-500">
          This is UI scaffolding only; server-side auth comes next.
        </p>
      </div>
    </main>
  )
}

