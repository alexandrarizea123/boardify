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
            className="rounded-full border border-[var(--color-tea-green-200)] bg-[var(--color-tea-green-50)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-tea-green-700)]"
          >
            {token}
          </span>
        )
      }
      return (
        <span
          key={`${token}-${index}`}
          className="text-xs text-[var(--color-tea-green-700)]"
        >
          {token}
        </span>
      )
    })
  }

  if (isEditing) {
    return (
      <article className="flex flex-col gap-2 rounded-xl border border-[var(--color-tea-green-200)] bg-white p-3 text-sm">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[var(--color-tea-green-800)]">
            Edit task
          </h3>
        </div>
        <input
          className="rounded-lg border border-[var(--color-tea-green-200)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-tea-green-400)]"
          value={draft.name}
          onChange={(event) => handleDraftChange('name', event.target.value)}
          placeholder="Task name"
        />
        <MentionTextarea
          className="min-h-16 resize-none rounded-lg border border-[var(--color-tea-green-200)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-tea-green-400)]"
          value={draft.description}
          onChange={(value) => handleDraftChange('description', value)}
          users={boardUsers}
          placeholder="Short description"
        />
        <select
          className="rounded-lg border border-[var(--color-tea-green-200)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-tea-green-400)]"
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
            className="flex-1 rounded-lg border border-[var(--color-tea-green-200)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-tea-green-400)]"
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
            className="flex-1 rounded-lg border border-[var(--color-tea-green-200)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-tea-green-400)]"
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
            className="flex-1 rounded-full border border-[var(--color-tea-green-700)] bg-[var(--color-tea-green-600)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-tea-green-50)]"
            type="button"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="flex-1 rounded-full border border-[var(--color-tea-green-200)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-tea-green-700)]"
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
    <article
      className="flex flex-col gap-2 rounded-xl border border-[var(--color-tea-green-200)] bg-white p-3 text-sm"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          'application/json',
          JSON.stringify({ taskId: task.id, columnId }),
        )
        event.dataTransfer.setData('text/plain', task.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isDone && (
            <span
              className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[var(--color-tea-green-300)] bg-[var(--color-tea-green-100)] text-[10px] font-semibold text-[var(--color-tea-green-700)]"
              aria-label="Done"
              title="Done"
            >
              ✓
            </span>
          )}
          <h3 className="font-semibold text-[var(--color-tea-green-900)]">
            {task.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
              priorityStyles[task.priority] ??
              'border-[var(--color-tea-green-200)] text-[var(--color-tea-green-600)]'
            }`}
          >
            {task.priority}
          </span>
          <button
            className="text-[10px] uppercase tracking-wide text-[var(--color-tea-green-600)] hover:text-[var(--color-tea-green-800)]"
            type="button"
            onClick={() => {
              setDraft(buildDraft(task))
              setIsEditing(true)
            }}
          >
            Edit
          </button>
          <button
            className="text-[10px] uppercase tracking-wide text-[var(--color-light-bronze-600)] hover:text-[var(--color-light-bronze-800)]"
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
      <div className="flex flex-wrap gap-2 text-[11px] text-[var(--color-tea-green-700)]">
        <span>Type: {task.type}</span>
        <span>Assignee: {task.assignee}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] text-[var(--color-tea-green-600)]">
        <span>Created {formatDate(task.createdAt)}</span>
        <span>Updated {formatDate(task.updatedAt)}</span>
      </div>
      <label className="text-[10px] uppercase tracking-wide text-[var(--color-tea-green-600)]">
        Move to
        <select
          className="mt-1 w-full rounded-lg border border-[var(--color-tea-green-200)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-tea-green-400)]"
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
