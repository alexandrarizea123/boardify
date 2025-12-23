import { useState } from 'react'
import { boardUsers, priorities, taskTypes } from '../../data/boardData'
import MentionTextarea from '../mentions/MentionTextarea'
import { formatDate } from '../../utils/date'

const buildDraft = (task) => ({
  name: task.name,
  description: task.description,
  assignee: task.assignee,
  type: task.type,
  priority: task.priority,
})

const priorityStyles = {
  Highest: 'bg-red-900 text-white border-red-900',
  High: 'bg-red-500 text-white border-red-500',
  Medium: 'bg-orange-400 text-white border-orange-400',
  Low: 'bg-blue-500 text-white border-blue-500',
}

function TaskCard({
  task,
  columnId,
  columns,
  onMoveTask,
  onDeleteTask,
  onUpdateTask,
  isDone,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(() => buildDraft(task))

  const handleDraftChange = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const handleSave = () => {
    if (!draft.name.trim()) return
    onUpdateTask(task.id, columnId, {
      name: draft.name.trim(),
      description: draft.description.trim(),
      assignee: draft.assignee,
      type: draft.type,
      priority: draft.priority,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraft(buildDraft(task))
    setIsEditing(false)
  }

  const renderDescription = (text) => {
    if (!text) return null
    const tokens = text.split(/(@\w+)/g)
    return tokens.map((token, index) => {
      const matchedUser = boardUsers.find(
        (user) => token.toLowerCase() === `@${user.toLowerCase()}`,
      )
      if (matchedUser) {
        return (
          <span
            key={`${token}-${index}`}
            className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
          >
            {token}
          </span>
        )
      }
      return (
        <span key={`${token}-${index}`} className="text-xs text-slate-500">
          {token}
        </span>
      )
    })
  }

  if (isEditing) {
    return (
      <article className="flex flex-col gap-2 border border-slate-200 bg-white p-3 text-sm">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">Edit task</h3>
        </div>
        <input
          className="border border-slate-200 px-2 py-1 text-xs outline-none"
          value={draft.name}
          onChange={(event) => handleDraftChange('name', event.target.value)}
          placeholder="Task name"
        />
        <MentionTextarea
          className="min-h-16 resize-none border border-slate-200 px-2 py-1 text-xs outline-none"
          value={draft.description}
          onChange={(value) => handleDraftChange('description', value)}
          users={boardUsers}
          placeholder="Short description"
        />
        <select
          className="border border-slate-200 px-2 py-1 text-xs outline-none"
          value={draft.assignee}
          onChange={(event) => handleDraftChange('assignee', event.target.value)}
        >
          {boardUsers.map((user) => (
            <option key={user} value={user}>
              {user}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select
            className="flex-1 border border-slate-200 px-2 py-1 text-xs outline-none"
            value={draft.type}
            onChange={(event) => handleDraftChange('type', event.target.value)}
          >
            {taskTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            className="flex-1 border border-slate-200 px-2 py-1 text-xs outline-none"
            value={draft.priority}
            onChange={(event) =>
              handleDraftChange('priority', event.target.value)
            }
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 border border-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-wide"
            type="button"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="flex-1 border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </article>
    )
  }

  return (
    <article className="flex flex-col gap-2 border border-slate-200 p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isDone && (
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-700"
              aria-label="Done"
              title="Done"
            >
              ✓
            </span>
          )}
          <h3 className="font-semibold">{task.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${priorityStyles[task.priority] ?? 'border-slate-200 text-slate-400'
              }`}
          >
            {task.priority}
          </span>
          <button
            className="text-[10px] uppercase tracking-wide text-slate-400 hover:text-slate-700"
            type="button"
            onClick={() => {
              setDraft(buildDraft(task))
              setIsEditing(true)
            }}
          >
            Edit
          </button>
          <button
            className="text-[10px] uppercase tracking-wide text-slate-400 hover:text-slate-700"
            type="button"
            onClick={() => onDeleteTask(task.id, columnId)}
          >
            Delete
          </button>
        </div>
      </div>
      {task.description && (
        <p className="flex flex-wrap gap-1">
          {renderDescription(task.description)}
        </p>
      )}
      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
        <span>Type: {task.type}</span>
        <span>Assignee: {task.assignee}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
        <span>Created {formatDate(task.createdAt)}</span>
        <span>Updated {formatDate(task.updatedAt)}</span>
      </div>
      <label className="text-[10px] uppercase tracking-wide text-slate-400">
        Move to
        <select
          className="mt-1 w-full border border-slate-200 px-2 py-1 text-xs outline-none"
          value={columnId}
          onChange={(event) =>
            onMoveTask(task.id, columnId, event.target.value)
          }
        >
          {columns.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
    </article>
  )
}

export default TaskCard
