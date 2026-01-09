'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { requestJson } from '../../api/requestJson'

export default function ProfileGate() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [boards, setBoards] = useState([])
  const [boardsError, setBoardsError] = useState('')
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
        setBoardsError('')
        const data = await requestJson('/api/collab-boards')
        if (!isMounted) return
        setBoards(Array.isArray(data) ? data : [])
      } catch (err) {
        if (isMounted) {
          setBoards([])
          setBoardsError(err?.message || 'Failed to load collaborative boards')
        }
      }
    }

    if (user?.email) void loadBoards()

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
    } catch (err) {
      setBoardsError(err?.message || 'Failed to create collaborative board')
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-100 bg-white px-6 py-3">
        <div className="mx-auto flex w-full max-w-[1100px] items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              onClick={() => router.push('/board')}
            >
              My boards
            </button>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-800"
              onClick={() => router.push('/profile')}
            >
              Profile
            </button>
          </div>

          <div className="flex items-center gap-3">
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
        </div>
      </header>

      <main className="px-6 py-10">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-slate-900">Profile</h1>
            <p className="mt-1 text-sm text-slate-600">
              Signed in as <span className="font-semibold">{user.email}</span>
              {user.name ? (
                <>
                  {' '}
                  · <span className="font-semibold">{user.name}</span>
                </>
              ) : null}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Collaborative Boards
                </h2>
                <p className="text-sm text-slate-600">
                  Create a collaborative board as an admin and invite other users.
                </p>
              </div>
            </div>

            <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={handleCreateBoard}>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-700">Board name</span>
                <input
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  value={boardName}
                  onChange={(event) => setBoardName(event.target.value)}
                  placeholder="Release Pipeline"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-700">Description (optional)</span>
                <input
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                  value={boardDescription}
                  onChange={(event) => setBoardDescription(event.target.value)}
                  placeholder="Team shared delivery board"
                />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isCreating}
                >
                  Create collaborative board
                </button>
              </div>
            </form>

            {boardsError && (
              <div
                className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                role="alert"
              >
                {boardsError}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-4">
              {sortedBoards.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No collaborative boards yet.
                </p>
              ) : (
                sortedBoards.map((board) => (
                  <div
                    key={board.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {board.name}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <p className="text-xs text-slate-600">
                            {board.description || 'No description'}
                          </p>
                          {board?._collabRole ? (
                            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                              {board._collabRole}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="mt-3 w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 sm:mt-0"
                        onClick={() => router.push(`/collab?board=${board.id}`)}
                      >
                        Open
                      </button>
                    </div>

                    {board?._collabRole === 'admin' ? (
                      <form
                        className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end"
                        onSubmit={(event) => handleInvite(event, board.id)}
                      >
                        <label className="flex flex-1 flex-col gap-1">
                          <span className="text-xs font-semibold text-slate-700">
                            Invite by email
                          </span>
                          <input
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-400"
                            value={inviteEmailByBoard?.[board.id] || ''}
                            onChange={(event) =>
                              setInviteEmailByBoard((current) => ({
                                ...(current || {}),
                                [board.id]: event.target.value,
                              }))
                            }
                            placeholder="teammate@example.com"
                          />
                        </label>
                        <button
                          type="submit"
                          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-slate-200 transition hover:ring-slate-300"
                        >
                          Invite
                        </button>
                      </form>
                    ) : (
                      <p className="mt-4 text-xs text-slate-500">
                        Only board admins can invite members.
                      </p>
                    )}

                    {inviteResultByBoard?.[board.id]?.error ? (
                      <p className="mt-2 text-sm text-rose-700">
                        {inviteResultByBoard[board.id].error}
                      </p>
                    ) : inviteResultByBoard?.[board.id]?.status ? (
                      <div className="mt-2 text-sm text-slate-700">
                        <p>
                          Invite status:{' '}
                          <span className="font-semibold">
                            {inviteResultByBoard[board.id].status}
                          </span>
                        </p>
                        {inviteResultByBoard?.[board.id]?.inviteToken ? (
                          <p className="mt-1 text-xs text-slate-500">
                            Invite token (share with the user):{' '}
                            <span className="font-mono">
                              {inviteResultByBoard[board.id].inviteToken}
                            </span>
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-900">
                Accept an invite
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Paste an invite token you received from a board admin.
              </p>
              <form className="mt-3 flex flex-col gap-2 sm:flex-row" onSubmit={handleAcceptInvite}>
                <input
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-mono outline-none transition focus:border-slate-400"
                  value={inviteToken}
                  onChange={(event) => setInviteToken(event.target.value)}
                  placeholder="Invite token"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Accept invite
                </button>
              </form>
              {acceptResult ? (
                <p className="mt-2 text-sm text-slate-700">{acceptResult}</p>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
