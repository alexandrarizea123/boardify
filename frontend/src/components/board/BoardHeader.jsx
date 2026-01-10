import { useState } from 'react'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'

const FilterSelect = ({ value, onChange, options, prefix = '', defaultLabel = 'All' }) => (
  <div className="relative">
    <select
      className="appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="All">{defaultLabel}</option>
      {options.map((opt) => {
        const val = typeof opt === 'object' ? opt.value : opt
        const label = typeof opt === 'object' ? opt.label : opt
        // Handle special sprint cases
        if (val === 'All') return null
        if (val === 'None') return <option key={val} value={val}>No Sprint</option>
        return <option key={val} value={val}>{prefix}{label}</option>
      })}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
)

function BoardHeader({
  name,
  description,
  taskTypes = [],
  filterType = 'All',
  onFilterChange = () => { },
  searchQuery = '',
  onSearchChange = () => { },
  assigneeOptions = [],
  assigneeFilter = 'All',
  onAssigneeFilterChange = () => { },
  priorityOptions = [],
  priorityFilter = 'All',
  onPriorityFilterChange = () => { },
  difficultyOptions = [],
  difficultyFilter = 'All',
  onDifficultyFilterChange = () => { },
  sprintOptions = [],
  sprintFilter = 'All',
  onSprintFilterChange = () => { },
  projectTagOptions = [],
  projectTagFilter = 'All',
  onProjectTagFilterChange = () => { },
  subtaskFilter = 'All',
  onSubtaskFilterChange = () => { },
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

  const FilterSelect = ({ value, onChange, options, prefix = '', defaultLabel = 'All' }) => (
    <div className="relative">
      <select
        className="appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="All">{defaultLabel}</option>
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt
          const label = typeof opt === 'object' ? opt.label : opt
          // Handle special sprint cases
          if (val === 'All') return null
          if (val === 'None') return <option key={val} value={val}>No Sprint</option>
          return <option key={val} value={val}>{prefix}{label}</option>
        })}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px] group">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
          <input
            className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2.5 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks..."
          />
        </div>

        <button
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold shadow-sm transition-all focus:ring-4 focus:ring-slate-900/5 ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900'}`}
          type="button"
          onClick={() => setShowFilters((current) => !current)}
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          Filters
        </button>

        {!isEditing && (
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 hover:shadow-md"
            type="button"
            onClick={handleStartEdit}
          >
            <PencilSquareIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Rename</span>
          </button>
        )}
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-red-600 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:shadow-md"
          type="button"
          onClick={onDelete}
        >
          <TrashIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>

      {showFilters && !isEditing ? (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
            <FilterSelect value={filterType} onChange={onFilterChange} options={taskTypes} defaultLabel="All Types" />
            <FilterSelect
              value={assigneeFilter}
              onChange={onAssigneeFilterChange}
              options={assigneeOptions.filter(a => a !== 'All')}
              defaultLabel="All Assignees"
            />
            <FilterSelect
              value={sprintFilter}
              onChange={onSprintFilterChange}
              options={sprintOptions}
              defaultLabel="All Sprints"
            />
            <FilterSelect
              value={priorityFilter}
              onChange={onPriorityFilterChange}
              options={priorityOptions.filter(p => p !== 'All')}
              defaultLabel="All Priorities"
            />
            <FilterSelect
              value={difficultyFilter}
              onChange={onDifficultyFilterChange}
              options={difficultyOptions.filter(d => d !== 'All')}
              defaultLabel="All Difficulties"
            />
            <div className="relative">
              <select
                className="appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-700 shadow-sm outline-none transition-all hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 cursor-pointer"
                value={subtaskFilter}
                onChange={(e) => onSubtaskFilterChange(e.target.value)}
              >
                <option value="All">All Subtasks</option>
                <option value="Has Subtasks">Has Subtasks</option>
                <option value="No Subtasks">No Subtasks</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <FilterSelect
              value={projectTagFilter}
              onChange={onProjectTagFilterChange}
              options={projectTagOptions}
              defaultLabel="All Tags"
            />
          </div>
        </div>
      ) : null}

      {isEditing ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-200">
          <div className="space-y-3">
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-lg font-bold outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 placeholder:font-normal"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Board name"
            />
            <textarea
              className="min-h-[72px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              value={draftDescription}
              onChange={(event) => setDraftDescription(event.target.value)}
              placeholder="Board description"
            />
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
                type="button"
                onClick={handleSave}
              >
                Save Changes
              </button>
              <button
                className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default BoardHeader
