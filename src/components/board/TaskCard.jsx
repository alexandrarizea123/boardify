import { useEffect, useState } from 'react'
import { boardUsers, priorities, taskTypes } from '../../data/boardData'
import { formatDate } from '../../utils/date'

const buildDraft = (task) => ({
  name: task.name,
  description: task.description,
  assignee: task.assignee,
  type: task.type,
  priority: task.priority,
})

function TaskCard({
  task,
  columnId,
  columns,
  onMoveTask,
  onDeleteTask,
  onUpdateTask,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(() => buildDraft(task))

  useEffect(() => {
    setDraft(buildDraft(task))
  }, [
    task.id,
    task.name,
    task.description,
    task.assignee,
    task.type,
    task.priority,
  ])

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
        <textarea
          className="min-h-[64px] resize-none border border-slate-200 px-2 py-1 text-xs outline-none"
          value={draft.description}
          onChange={(event) =>
            handleDraftChange('description', event.target.value)
          }
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
        <h3 className="font-semibold">{task.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">
            {task.priority}
          </span>
          <button
            className="text-[10px] uppercase tracking-wide text-slate-400 hover:text-slate-700"
            type="button"
            onClick={() => setIsEditing(true)}
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
        <p className="text-xs text-slate-500">{task.description}</p>
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
