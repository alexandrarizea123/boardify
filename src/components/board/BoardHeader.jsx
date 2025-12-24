import { useState } from 'react'

function BoardHeader({
  name,
  description,
  taskTypes = [],
  filterType = 'All',
  onFilterChange = () => {},
  assigneeOptions = [],
  assigneeFilter = 'All',
  onAssigneeFilterChange = () => {},
  priorityOptions = [],
  priorityFilter = 'All',
  onPriorityFilterChange = () => {},
  difficultyOptions = [],
  difficultyFilter = 'All',
  onDifficultyFilterChange = () => {},
  subtaskFilter = 'All',
  onSubtaskFilterChange = () => {},
  onUpdate,
  onDelete,
}) {
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
    <header className="space-y-3 rounded-md border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Task Management Board
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-slate-300"
            value={filterType}
            onChange={(e) => onFilterChange(e.target.value)}
          >
            <option value="All">All Types</option>
            {taskTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-slate-300"
            value={assigneeFilter}
            onChange={(e) => onAssigneeFilterChange(e.target.value)}
          >
            <option value="All">All Assignees</option>
            {assigneeOptions
              .filter((assignee) => assignee !== 'All')
              .map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
          </select>
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-slate-300"
            value={priorityFilter}
            onChange={(e) => onPriorityFilterChange(e.target.value)}
          >
            <option value="All">All Priorities</option>
            {priorityOptions
              .filter((priority) => priority !== 'All')
              .map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
          </select>
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-slate-300"
            value={difficultyFilter}
            onChange={(e) => onDifficultyFilterChange(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            {difficultyOptions
              .filter((difficulty) => difficulty !== 'All')
              .map((difficulty) => (
                <option key={difficulty} value={difficulty}>
                  {difficulty}
                </option>
              ))}
          </select>
          <select
            className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-slate-300"
            value={subtaskFilter}
            onChange={(e) => onSubtaskFilterChange(e.target.value)}
          >
            <option value="All">All Subtasks</option>
            <option value="Has Subtasks">Has Subtasks</option>
            <option value="No Subtasks">No Subtasks</option>
          </select>
          {!isEditing && (
            <button
              className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900"
              type="button"
              onClick={handleStartEdit}
            >
              Rename
            </button>
          )}
          <button
            className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900"
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
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-2xl font-semibold outline-none focus:border-slate-300"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Board name"
          />
          <textarea
            className="min-h-[88px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
            value={draftDescription}
            onChange={(event) => setDraftDescription(event.target.value)}
            placeholder="Board description"
          />
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900"
              type="button"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700"
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
            <p className="max-w-2xl text-sm text-slate-600">
              {description}
            </p>
          )}
        </div>
      )}
    </header>
  )
}

export default BoardHeader
