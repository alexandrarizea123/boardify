import { useState } from 'react'
import { boardUsers, priorities, difficulties, createId } from '../../data/boardData'
import MentionTextarea from '../mentions/MentionTextarea'
import { formatDate, getDueDateStatus } from '../../utils/date'

const buildDraft = (task) => ({
  name: task.name,
  description: task.description,
  assignee: task.assignee,
  type: task.type,
  priority: task.priority,
  difficulty: task.difficulty || difficulties[1],
  estimatedTime: task.estimatedTime || '',
  dueDate: task.dueDate || '',
  subtasks: task.subtasks ? [...task.subtasks] : [],
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

const getDueDateBadgeColor = (status) => {
  switch (status) {
    case 'overdue':
      return 'text-red-600 bg-red-50 border-red-100'
    case 'due-soon':
      return 'text-amber-600 bg-amber-50 border-amber-100'
    default:
      return 'text-slate-500 bg-slate-50 border-slate-200'
  }
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
  const [newSubtaskName, setNewSubtaskName] = useState('')

  const handleDraftChange = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }))
  }

  const handleToggleSubtask = (subtaskId) => {
    const updatedSubtasks = (task.subtasks || []).map((t) =>
      t.id === subtaskId ? { ...t, isCompleted: !t.isCompleted } : t,
    )
    onUpdateTask(task.id, columnId, { subtasks: updatedSubtasks })
  }

  const handleAddSubtask = () => {
    const trimmed = newSubtaskName.trim()
    if (!trimmed) return
    const newSubtask = { id: createId(), title: trimmed, isCompleted: false }
    setDraft((current) => ({
      ...current,
      subtasks: [...current.subtasks, newSubtask],
    }))
    setNewSubtaskName('')
  }

  const handleRemoveSubtask = (subtaskId) => {
    setDraft((current) => ({
      ...current,
      subtasks: current.subtasks.filter((t) => t.id !== subtaskId),
    }))
  }

  const handleSubtaskNameChange = (subtaskId, newName) => {
    setDraft((current) => ({
      ...current,
      subtasks: current.subtasks.map((t) =>
        t.id === subtaskId ? { ...t, title: newName } : t,
      ),
    }))
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
      dueDate: draft.dueDate,
      subtasks: draft.subtasks,
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
  
  const dueDateStatus = getDueDateStatus(task.dueDate)

  if (isEditing) {
    return (
      <article className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-2 text-sm">
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

        <div className="space-y-2">
          {draft.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex gap-2">
              <input
                className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
                value={subtask.title}
                onChange={(e) =>
                  handleSubtaskNameChange(subtask.id, e.target.value)
                }
                placeholder="Subtask name"
              />
              <button
                type="button"
                className="text-slate-400 hover:text-red-500"
                onClick={() => handleRemoveSubtask(subtask.id)}
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
              value={newSubtaskName}
              onChange={(e) => setNewSubtaskName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddSubtask()
                }
              }}
              placeholder="+ Add subtask"
            />
            <button
              type="button"
              className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900"
              onClick={handleAddSubtask}
            >
              Add
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
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

          {isAddingType ? (
            <input
              className="w-full min-w-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
              value={newTypeValue}
              onChange={(e) => setNewTypeValue(e.target.value)}
              onBlur={handleNewTypeSubmit}
              onKeyDown={handleNewTypeKeyDown}
              placeholder="Type..."
              autoFocus
            />
          ) : (
            <select
              className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
              value={draft.type}
              onChange={handleTypeChange}
            >
              {taskTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
              <option value="__new__" className="font-semibold text-slate-500">
                + New type
              </option>
            </select>
          )}

          <select
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
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

          <select
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
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
        </div>
        
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
            value={draft.estimatedTime}
            onChange={(event) =>
              handleDraftChange('estimatedTime', event.target.value)
            }
            placeholder="Est. time"
          />
          <input
            type="date"
            className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
            value={draft.dueDate}
            onChange={(event) => handleDraftChange('dueDate', event.target.value)}
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
      className="flex flex-col gap-1.5 rounded-md border border-slate-200 bg-white p-2 text-sm shadow-sm transition-shadow hover:shadow-md"
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
        <div className="flex min-w-0 flex-1 items-start gap-1.5">
          <div
            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${getTypeColor(task.type)}`}
            title={`Type: ${task.type}`}
          />
          <h3 className="break-words font-semibold text-slate-900 leading-tight">
            {task.name}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {dueDateStatus && (
            <span
              className={`rounded-md border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide ${getDueDateBadgeColor(
                dueDateStatus.status,
              )}`}
              title={formatDate(task.dueDate)}
            >
              {dueDateStatus.text}
            </span>
          )}
          <span
            className={`rounded-md border px-1 py-0 text-[9px] uppercase tracking-wide ${
              priorityStyles[task.priority] ??
              'border-slate-200 text-slate-700'
            }`}
          >
            {task.priority}
          </span>
          <button
            className="p-0.5 text-slate-400 hover:text-slate-900"
            type="button"
            onClick={() => {
              setDraft(buildDraft(task))
              setIsEditing(true)
            }}
            aria-label="Edit"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            className="p-0.5 text-slate-400 hover:text-red-600"
            type="button"
            onClick={() => onDeleteTask(task.id, columnId)}
            aria-label="Delete"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      {task?.description && (
        <p className="ml-3.5 text-xs text-slate-600 line-clamp-2">
          {renderDescription(task.description)}
        </p>
      )}

      {task?.subtasks && task.subtasks.length > 0 && (
        <div className="ml-3.5 mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${
                    (task.subtasks.filter((t) => t?.isCompleted).length /
                      task.subtasks.length) *
                    100
                  }%`,
                }}
              />
            </div>
            <span className="text-[10px] font-medium text-slate-500">
              {task.subtasks.filter((t) => t?.isCompleted).length}/
              {task.subtasks.length}
            </span>
          </div>
          <div className="space-y-1">
            {task.subtasks.map((subtask) => (
              subtask && (
                <label
                  key={subtask.id}
                  className="flex items-start gap-2 text-xs text-slate-700 hover:text-slate-900 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                    checked={!!subtask.isCompleted}
                    onChange={() => handleToggleSubtask(subtask.id)}
                  />
                  <span className={subtask.isCompleted ? 'text-slate-400 line-through' : ''}>
                    {subtask.title}
                  </span>
                </label>
              )
            ))}
          </div>
        </div>
      )}

      <div className="ml-3.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
        <span className="flex items-center gap-1" title="Assignee">
          <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {task.assignee}
        </span>

        {(task.difficulty || task.estimatedTime) && (
          <>
            <span className="text-slate-300">•</span>
            {task.difficulty && (
              <span className="font-medium text-slate-700" title="Difficulty">
                {task.difficulty}
              </span>
            )}
            {task.estimatedTime && (
              <span className="flex items-center gap-1" title="Estimated Time">
                 <span className="text-slate-300">•</span>
                <svg className="h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {task.estimatedTime}
              </span>
            )}
          </>
        )}
      </div>
    </article>
  )
}

export default TaskCard
