import { useState } from 'react'

function BoardHeader({
  name,
  description,
  taskTypes = [],
  filterType = 'All',
  onFilterChange = () => {},
  searchQuery = '',
  onSearchChange = () => {},
  assigneeOptions = [],
  assigneeFilter = 'All',
  onAssigneeFilterChange = () => {},
  priorityOptions = [],
  priorityFilter = 'All',
  onPriorityFilterChange = () => {},
  difficultyOptions = [],
  difficultyFilter = 'All',
  onDifficultyFilterChange = () => {},
  sprintOptions = [],
  sprintFilter = 'All',
  onSprintFilterChange = () => {},
  projectTagOptions = [],
  projectTagFilter = 'All',
  onProjectTagFilterChange = () => {},
  subtaskFilter = 'All',
  onSubtaskFilterChange = () => {},
  onUpdate,
  onDelete,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
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
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2 text-sm text-slate-800 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks..."
          />
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300"
          type="button"
          onClick={() => setShowFilters((current) => !current)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" />
          </svg>
          Filters
        </button>
        {!isEditing && (
          <button
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            type="button"
            onClick={handleStartEdit}
          >
            Rename
          </button>
        )}
        <button
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
          type="button"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>

      {showFilters && !isEditing ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <select
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
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
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
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
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
            value={sprintFilter}
            onChange={(e) => onSprintFilterChange(e.target.value)}
          >
            {sprintOptions.map((sprint) => {
              if (sprint === 'All') return <option key={sprint} value={sprint}>All Sprints</option>
              if (sprint === 'None') return <option key={sprint} value={sprint}>No Sprint</option>
              return <option key={sprint} value={sprint}>{sprint}</option>
            })}
          </select>
          <select
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
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
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
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
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
            value={subtaskFilter}
            onChange={(e) => onSubtaskFilterChange(e.target.value)}
          >
            <option value="All">All Subtasks</option>
            <option value="Has Subtasks">Has Subtasks</option>
            <option value="No Subtasks">No Subtasks</option>
          </select>
          <select
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
            value={projectTagFilter}
            onChange={(e) => onProjectTagFilterChange(e.target.value)}
          >
            <option value="All">All Tags</option>
            <option value="Untagged">Untagged</option>
            {projectTagOptions.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {isEditing ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-3">
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-lg font-semibold outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Board name"
            />
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
              value={draftDescription}
              onChange={(event) => setDraftDescription(event.target.value)}
              placeholder="Board description"
            />
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-800"
                type="button"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default BoardHeader
