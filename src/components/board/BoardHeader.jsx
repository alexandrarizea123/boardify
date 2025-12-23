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
    <header className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Task Management Board
        </p>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <button
              className="border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
              type="button"
              onClick={handleStartEdit}
            >
              Rename
            </button>
          )}
          <button
            className="border border-red-200 px-3 py-1 text-xs font-semibold text-red-500 hover:border-red-300 hover:text-red-600"
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
            className="w-full border border-slate-200 px-3 py-2 text-2xl font-semibold outline-none"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Board name"
          />
          <textarea
            className="min-h-[88px] w-full border border-slate-200 px-3 py-2 text-sm outline-none"
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
            placeholder="Board description"
          />
          <div className="flex flex-wrap gap-2">
            <button
              className="border border-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide"
              type="button"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
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
            <p className="max-w-2xl text-sm text-slate-500">{description}</p>
          )}
        </div>
      )}
    </header>
  )
}

export default BoardHeader
