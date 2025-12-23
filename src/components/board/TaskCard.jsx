import { useState } from 'react'
import { boardUsers, priorities, difficulties } from '../../data/boardData'
import MentionTextarea from '../mentions/MentionTextarea'
import { formatDate } from '../../utils/date'

const buildDraft = (task) => ({
  name: task.name,
  description: task.description,
  assignee: task.assignee,
  type: task.type,
  priority: task.priority,
  difficulty: task.difficulty || difficulties[1],
  estimatedTime: task.estimatedTime || '',
})

const priorityStyles = {
  Highest: 'bg-red-200 text-red-800 border-red-200',
  High: 'bg-red-100 text-red-700 border-red-100',
  Medium: 'bg-orange-100 text-orange-800 border-orange-100',
  Low: 'bg-blue-100 text-blue-800 border-blue-100',
}

const typeColors = {
  Feature: 'bg-green-500',
  Bug: 'bg-red-500',
  Chore: 'bg-slate-500',
  Research: 'bg-purple-500',
}

const defaultTypeColors = [
  'bg-blue-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-cyan-500',
]

const getTypeColor = (type) => {
  if (typeColors[type]) return typeColors[type]
  
  // Simple hash to pick a stable color for custom types
  let hash = 0
  for (let i = 0; i < type.length; i++) {
    hash = type.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const index = Math.abs(hash) % defaultTypeColors.length
  return defaultTypeColors[index]
}

function TaskCard({
  task,
  columnId,
  columns,
  taskTypes,
  onAddType,
  onMoveTask,
  onDeleteTask,
  onUpdateTask,
  isDone,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(() => buildDraft(task))
  const [isAddingType, setIsAddingType] = useState(false)
  const [newTypeValue, setNewTypeValue] = useState('')

  const handleDraftChange = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const handleTypeChange = (event) => {
    const value = event.target.value
    if (value === '__new__') {
      setIsAddingType(true)
      setNewTypeValue('')
    } else {
      handleDraftChange('type', value)
    }
  }

  const handleNewTypeSubmit = () => {
    const trimmed = newTypeValue.trim()
    if (trimmed) {
      onAddType(trimmed)
      handleDraftChange('type', trimmed)
    }
    setIsAddingType(false)
    setNewTypeValue('')
  }

  const handleNewTypeKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleNewTypeSubmit()
    } else if (event.key === 'Escape') {
      setIsAddingType(false)
      setNewTypeValue('')
    }
  }

  const handleSave = () => {
    if (!draft.name.trim()) return
    onUpdateTask(task.id, columnId, {
      name: draft.name.trim(),
      description: draft.description.trim(),
      assignee: draft.assignee,
      type: draft.type,
      priority: draft.priority,
      difficulty: draft.difficulty,
      estimatedTime: draft.estimatedTime,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraft(buildDraft(task))
    setIsEditing(false)
    setIsAddingType(false)
    setNewTypeValue('')
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
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700"
          >
            {token}
          </span>
        )
      }
      return (
        <span
          key={`${token}-${index}`}
          className="text-xs text-slate-700"
        >
          {token}
        </span>
      )
    })
  }

  if (isEditing) {
    return (
      <article className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900">
            Edit task
          </h3>
        </div>
        <input
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
          value={draft.name}
          onChange={(event) => handleDraftChange('name', event.target.value)}
          placeholder="Task name"
        />
        <MentionTextarea
          className="min-h-16 resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
          value={draft.description}
          onChange={(value) => handleDraftChange('description', value)}
          users={boardUsers}
          placeholder="Short description"
        />
        <select
          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
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
          {isAddingType ? (
            <div className="flex flex-1 items-center gap-1">
              <input
                className="w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
                value={newTypeValue}
                onChange={(e) => setNewTypeValue(e.target.value)}
                onBlur={handleNewTypeSubmit}
                onKeyDown={handleNewTypeKeyDown}
                placeholder="Type name..."
                autoFocus
              />
            </div>
          ) : (
            <select
              className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
              value={draft.type}
              onChange={handleTypeChange}
            >
              {taskTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="__new__" className="font-semibold text-slate-500">
                + Add new type...
              </option>
            </select>
          )}
          <select
            className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
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
          <select
            className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
            value={draft.difficulty}
            onChange={(event) =>
              handleDraftChange('difficulty', event.target.value)
            }
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
          <input
            className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
            value={draft.estimatedTime}
            onChange={(event) =>
              handleDraftChange('estimatedTime', event.target.value)
            }
            placeholder="Est. time"
          />
        </div>
        <div className="flex gap-2">
          <button
            className="flex-1 rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900"
            type="button"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700"
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
      className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm"
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
            className="inline-flex h-4 w-4 items-center justify-center rounded-md border border-green-200 bg-green-50 text-[10px] font-semibold text-green-700"
              aria-label="Done"
              title="Done"
            >
              ✓
            </span>
          )}
          <h3 className="font-semibold text-slate-900">
            {task.name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-md border px-2 py-0.5 text-[10px] uppercase tracking-wide ${
              priorityStyles[task.priority] ??
              'border-slate-200 text-slate-700'
            }`}
          >
            {task.priority}
          </span>
          <button
            className="text-[10px] uppercase tracking-wide text-slate-600 hover:text-slate-900"
            type="button"
            onClick={() => {
              setDraft(buildDraft(task))
              setIsEditing(true)
            }}
          >
            Edit
          </button>
          <button
            className="text-[10px] uppercase tracking-wide text-slate-600 hover:text-slate-900"
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
      <div className="flex flex-wrap gap-2 text-[11px] text-slate-700">
        <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium">
          <span
            className={`h-1.5 w-1.5 rounded-full ${getTypeColor(task.type)}`}
          />
          {task.type}
        </span>
        <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
          Assignee: {task.assignee}
        </span>
        {task.difficulty && (
          <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
            Diff: {task.difficulty}
          </span>
        )}
        {task.estimatedTime && (
          <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5">
            Est: {task.estimatedTime}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] text-slate-600">
        <span>Created {formatDate(task.createdAt)}</span>
        <span>Updated {formatDate(task.updatedAt)}</span>
      </div>
      <label className="text-[10px] uppercase tracking-wide text-slate-600">
        Move to
        <select
          className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
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
