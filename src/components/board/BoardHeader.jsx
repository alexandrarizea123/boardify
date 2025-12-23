import { useState } from 'react'

function BoardHeader({ name, description, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(name)
  const [draftDescription, setDraftDescription] = useState(description || '')

  const handleStartEdit = () => {
    setDraftName(name)
    setDraftDescription(description || '')
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraftName(name)
    setDraftDescription(description || '')
    setIsEditing(false)
  }

  const handleSave = () => {
    const trimmedName = draftName.trim()
    if (!trimmedName) return
    onUpdate({
      name: trimmedName,
      description: draftDescription.trim(),
    })
    setIsEditing(false)
  }

  return (
    <header className="space-y-3 rounded-2xl border border-[var(--color-tea-green-200)] bg-[var(--color-beige-50)] p-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-tea-green-600)]">
          Task Management Board
        </p>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              className="rounded-full border border-[var(--color-tea-green-200)] px-3 py-1 text-xs font-semibold text-[var(--color-tea-green-700)] hover:border-[var(--color-tea-green-300)] hover:text-[var(--color-tea-green-900)]"
              type="button"
              onClick={handleStartEdit}
            >
              Rename
            </button>
          )}
          <button
            className="rounded-full border border-[var(--color-light-bronze-200)] px-3 py-1 text-xs font-semibold text-[var(--color-light-bronze-700)] hover:border-[var(--color-light-bronze-300)] hover:text-[var(--color-light-bronze-800)]"
            type="button"
            onClick={onDelete}
          >
            Delete board
          </button>
        </div>
      </div>
      {isEditing ? (
        <div className="space-y-3">
          <input
            className="w-full rounded-xl border border-[var(--color-tea-green-200)] bg-white px-3 py-2 text-2xl font-semibold outline-none focus:border-[var(--color-tea-green-400)]"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Board name"
          />
          <textarea
            className="min-h-[88px] w-full rounded-xl border border-[var(--color-tea-green-200)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-tea-green-400)]"
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
            placeholder="Board description"
          />
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-full border border-[var(--color-tea-green-700)] bg-[var(--color-tea-green-600)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-tea-green-50)]"
              type="button"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="rounded-full border border-[var(--color-tea-green-200)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-tea-green-700)]"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">{name}</h1>
          {description && (
            <p className="max-w-2xl text-sm text-[var(--color-tea-green-700)]">
              {description}
            </p>
          )}
        </div>
      )}
    </header>
  )
}

export default BoardHeader
