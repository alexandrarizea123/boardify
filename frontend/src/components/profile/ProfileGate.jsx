'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { requestJson } from '../../api/requestJson'

export default function ProfileGate() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [boards, setBoards] = useState([])
  const [boardName, setBoardName] = useState('')
  const [boardDescription, setBoardDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [inviteEmailByBoard, setInviteEmailByBoard] = useState({})
  const [inviteResultByBoard, setInviteResultByBoard] = useState({})
  const [inviteToken, setInviteToken] = useState('')
  const [acceptResult, setAcceptResult] = useState('')

  const sortedBoards = useMemo(() => boards || [], [boards])

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

  useEffect(() => {
    let isMounted = true

    const loadBoards = async () => {
      try {
        const data = await requestJson('/api/collab-boards')
        if (!isMounted) return
        setBoards(Array.isArray(data) ? data : [])
      } catch (err) {
        if (isMounted) {
          setBoards([])
          // setBoardsError(err?.message || 'Failed to load collaborative boards')
          console.error(err)
        }
      }
    }

    if (user?.email) void loadBoards()

    return () => {
      isMounted = false
    }
  }, [user?.email])

  const [personalBoards, setPersonalBoards] = useState([])
  const [personalBoardsError, setPersonalBoardsError] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadPersonalBoards = async () => {
      try {
        setPersonalBoardsError('')
        const data = await requestJson('/api/boards')
        if (!isMounted) return
        setPersonalBoards(Array.isArray(data) ? data : [])
      } catch (err) {
        if (isMounted) {
          setPersonalBoards([])
          setPersonalBoardsError(err?.message || 'Failed to load personal boards')
        }
      }
    }

    if (user?.email) void loadPersonalBoards()

    return () => {
      isMounted = false
    }
  }, [user?.email])

  const handleCreateBoard = async (event) => {
    event.preventDefault()
    if (isCreating) return

    const trimmedName = boardName.trim()
    if (!trimmedName) return

    setIsCreating(true)
    try {
      const created = await requestJson('/api/collab-boards', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
          description: boardDescription.trim(),
        }),
      })
      setBoards((current) => [...(current || []), created])
      setBoardName('')
      setBoardDescription('')
    } catch {
      // console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleInvite = async (event, boardId) => {
    event.preventDefault()
    const email = String(inviteEmailByBoard?.[boardId] || '').trim().toLowerCase()
    if (!email) return

    try {
      const result = await requestJson(`/api/collab-boards/${boardId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setInviteResultByBoard((current) => ({ ...(current || {}), [boardId]: result }))
      setInviteEmailByBoard((current) => ({ ...(current || {}), [boardId]: '' }))
    } catch (err) {
      setInviteResultByBoard((current) => ({
        ...(current || {}),
        [boardId]: { error: err?.message || 'Invite failed' },
      }))
    }
  }

  const handleAcceptInvite = async (event) => {
    event.preventDefault()
    const token = inviteToken.trim()
    if (!token) return
    setAcceptResult('')
    try {
      const result = await requestJson('/api/collab-invites/accept', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })
      setAcceptResult(`Joined board ${result?.boardId || ''}`.trim())
      setInviteToken('')
      const nextBoards = await requestJson('/api/collab-boards')
      setBoards(Array.isArray(nextBoards) ? nextBoards : [])
    } catch (err) {
      setAcceptResult(err?.message || 'Failed to accept invite')
    }
  }

  if (isLoading) return null
  if (!user?.email) return null

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 z-50 w-full border-b border-indigo-100 bg-white/80 px-6 py-4 backdrop-blur-xl transition-all">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md"></div>
            <h1 className="font-bold text-slate-900 tracking-tight">Boardify</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-500 hidden sm:block">
              {user.email}
            </span>
            <button
              onClick={async () => {
                try {
                  await requestJson('/api/auth/logout', { method: 'POST' })
                } finally {
                  router.push('/auth')
                }
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Sign out
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-200 ring-2 ring-white"></div>
          </div>
        </div>
      </header>

      <main className="px-6 py-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">

          {/* Welcome Area */}
          <section>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {user.name || 'User'}</h2>
            <p className="text-slate-500 mt-2">Manage your projects and collaborate with your team.</p>
          </section>

          {/* Personal Boards */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Personal Space</h3>

            {personalBoardsError && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{personalBoardsError}</div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {personalBoards.map((board) => (
                <div key={board.id} className="group relative flex flex-col justify-between rounded-2xl border border-white/60 bg-white/50 p-6 shadow-glass backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-indigo-200">
                  <div>
                    <div className="mb-4 h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="font-bold text-slate-900">{board.name}</h4>
                    <p className="mt-2 text-sm text-slate-500 line-clamp-2">{board.description || 'No description'}</p>
                  </div>
                  <button
                    onClick={() => router.push('/board')}
                    className="mt-6 w-full rounded-xl bg-white border border-slate-200 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
                  >
                    Open Board
                  </button>
                </div>
              ))}

              {/* Create New Placeholder (Visual Only for Personal) */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-transparent p-6 text-center hover:bg-slate-50/50 transition-colors cursor-not-allowed opacity-60">
                <div className="mb-2 rounded-full bg-slate-100 p-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-slate-900">New Personal Board</p>
                <p className="text-xs text-slate-500 mt-1">Contact admin to enable</p>
              </div>
            </div>
          </section>

          {/* Collaborative Boards */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Team Space</h3>
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div className="space-y-4">
                {sortedBoards.map((board) => (
                  <div key={board.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg text-slate-900">{board.name}</h4>
                          {board._collabRole && (
                            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase text-indigo-600">
                              {board._collabRole}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{board.description}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/collab?board=${board.id}`)}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
                      >
                        Open
                      </button>
                    </div>

                    {board._collabRole === 'admin' && (
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <form onSubmit={(e) => handleInvite(e, board.id)} className="flex items-end gap-3">
                          <label className="flex-1 space-y-1">
                            <span className="text-xs font-semibold text-slate-500">Invite teammate</span>
                            <input
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all"
                              placeholder="email@example.com"
                              value={inviteEmailByBoard?.[board.id] || ''}
                              onChange={(e) => setInviteEmailByBoard(c => ({ ...c, [board.id]: e.target.value }))}
                            />
                          </label>
                          <button type="submit" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors">
                            Send Invite
                          </button>
                        </form>
                        {inviteResultByBoard?.[board.id] && (
                          <div className="mt-2 text-xs">
                            {inviteResultByBoard[board.id].error ? (
                              <span className="text-red-600">{inviteResultByBoard[board.id].error}</span>
                            ) : (
                              <span className="text-green-600">
                                Invite sent! Token: <span className="font-mono bg-slate-100 px-1 rounded">{inviteResultByBoard[board.id].inviteToken}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {sortedBoards.length === 0 && (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/50">
                    <p className="text-sm font-semibold text-slate-500">No team boards yet.</p>
                  </div>
                )}
              </div>

              {/* Sidebar Actions */}
              <div className="space-y-6">
                {/* Create Board Card */}
                <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-lg shadow-indigo-200">
                  <h4 className="font-bold text-lg">Create New Team Board</h4>
                  <p className="text-indigo-100 text-sm mt-1 mb-4">Start a new collaborative project.</p>

                  <form onSubmit={handleCreateBoard} className="space-y-3">
                    <input
                      className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-indigo-200 outline-none focus:bg-white/20 transition-all"
                      placeholder="Board Name"
                      value={boardName}
                      onChange={(e) => setBoardName(e.target.value)}
                    />
                    <input
                      className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder:text-indigo-200 outline-none focus:bg-white/20 transition-all"
                      placeholder="Description"
                      value={boardDescription}
                      onChange={(e) => setBoardDescription(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="w-full rounded-xl bg-white py-2.5 text-sm font-bold text-indigo-600 shadow-sm hover:bg-indigo-50 transition-colors"
                    >
                      {isCreating ? 'Creating...' : 'Create Board'}
                    </button>
                  </form>
                </div>

                {/* Join Board Card */}
                <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
                  <h4 className="font-bold text-slate-900">Join a Team</h4>
                  <p className="text-slate-500 text-sm mt-1 mb-4">Have an invite token?</p>
                  <form onSubmit={handleAcceptInvite} className="space-y-3">
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-indigo-500 transition-all font-mono"
                      placeholder="Paste token here"
                      value={inviteToken}
                      onChange={(e) => setInviteToken(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                    >
                      Join Board
                    </button>
                  </form>
                  {acceptResult && <p className="mt-2 text-xs font-semibold text-indigo-600">{acceptResult}</p>}
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
