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
  Highest: 'bg-red-50 text-red-700 border-red-200 ring-red-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-200',
  Low: 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-200',
}

const getTypeContent = (type) => {
  switch (type) {
    case 'Feature':
      return { icon: '🚀', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
    case 'Bug':
      return { icon: <span className="grayscale opacity-75">🐞</span>, style: 'bg-slate-100 text-slate-700 border-slate-200' }
    case 'Chore':
      return { icon: '🧹', style: 'bg-slate-50 text-slate-600 border-slate-200' }
    case 'Research':
      return { icon: '🔬', style: 'bg-purple-50 text-purple-700 border-purple-200' }
    default:
      return { icon: '📋', style: 'bg-slate-50 text-slate-600 border-slate-200' }
  }
}

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'Highest': 
      return (
        <svg className="h-3 w-3 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    case 'High':
      return (
        <svg className="h-3 w-3 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      )
    case 'Medium':
      return (
        <svg className="h-3 w-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      )
    case 'Low':
      return (
        <svg className="h-3 w-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      )
    default:
      return null
  }
}

const getDueDateBadgeColor = (status) => {
  switch (status) {
    case 'overdue':
      return 'text-red-700 bg-red-50 border-red-200'
    case 'due-soon':
      return 'text-amber-700 bg-amber-50 border-amber-200'
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200'
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
  const dueDateStatus = getDueDateStatus(task.dueDate)
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
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
          className="text-sm text-slate-600"
        >
          {token}
        </span>
      )
    })
  }
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name) => {
    const colors = [
      'bg-red-100 text-red-600',
      'bg-orange-100 text-orange-600',
      'bg-amber-100 text-amber-600',
      'bg-green-100 text-green-600',
      'bg-emerald-100 text-emerald-600',
      'bg-teal-100 text-teal-600',
      'bg-cyan-100 text-cyan-600',
      'bg-sky-100 text-sky-600',
      'bg-blue-100 text-blue-600',
      'bg-indigo-100 text-indigo-600',
      'bg-violet-100 text-violet-600',
      'bg-purple-100 text-purple-600',
      'bg-fuchsia-100 text-fuchsia-600',
      'bg-pink-100 text-pink-600',
      'bg-rose-100 text-rose-600',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  if (isEditing) {
    return (
      <article className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/50">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Edit task</h3>
        </div>
        <input
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
          value={draft.name}
          onChange={(event) => handleDraftChange('name', event.target.value)}
          placeholder="Task name"
        />
        <MentionTextarea
          className="min-h-[80px] resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
          value={draft.description}
          onChange={(value) => handleDraftChange('description', value)}
          users={boardUsers}
          placeholder="Add a description... (use @ to mention)"
        />
        
        <div className="space-y-2">
          {draft.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
                value={subtask.title}
                onChange={(e) =>
                  handleSubtaskNameChange(subtask.id, e.target.value)
                }
                placeholder="Subtask name"
              />
              <button
                type="button"
                className="text-slate-400 hover:text-red-500 transition-colors"
                onClick={() => handleRemoveSubtask(subtask.id)}
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
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
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
              onClick={handleAddSubtask}
            >
              Add
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <select
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
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
              className="w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
              value={newTypeValue}
              onChange={(e) => setNewTypeValue(e.target.value)}
              onBlur={handleNewTypeSubmit}
              onKeyDown={handleNewTypeKeyDown}
              placeholder="Type..."
              autoFocus
            />
          ) : (
            <select
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
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
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
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
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
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
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
            value={draft.estimatedTime}
            onChange={(event) =>
              handleDraftChange('estimatedTime', event.target.value)
            }
            placeholder="Est. time"
          />
          <input
            type="date"
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
            value={draft.dueDate}
            onChange={(event) => handleDraftChange('dueDate', event.target.value)}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            type="button"
            onClick={handleSave}
          >
            Save Changes
          </button>
          <button
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </article>
    )
  }

  const typeContent = getTypeContent(task.type)

  return (
    <article
      className={`group relative flex flex-col gap-3 rounded-xl p-4 shadow-sm ring-1 ring-slate-200/50 transition-all duration-200 cursor-pointer ${
        isExpanded ? 'bg-slate-50/50 shadow-md ring-slate-300/50' : 'bg-white hover:-translate-y-0.5 hover:shadow-md hover:ring-slate-300/50'
      }`}
      draggable
      onClick={(e) => {
        // Prevent expansion toggle when clicking specific interactive elements
        if (e.defaultPrevented) return;
        setIsExpanded(!isExpanded);
      }}
      onDragStart={(event) => {
        event.dataTransfer.setData(
          'application/json',
          JSON.stringify({ taskId: task.id, columnId }),
        )
        event.dataTransfer.setData('text/plain', task.id)
        event.dataTransfer.effectAllowed = 'move'
        const el = event.currentTarget
        el.style.transform = 'rotate(3deg)'
      }}
      onDragEnd={(event) => {
        event.currentTarget.style.transform = ''
      }}
    >
      {/* Avatar Overlap */}
      <div 
        className={`absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-sm ring-2 ring-white ${getAvatarColor(task.assignee)}`}
        title={task.assignee}
      >
        {getInitials(task.assignee)}
      </div>

      <div className="flex flex-col gap-2">
        {/* Title & Expand Icon */}
        <div className="flex items-start justify-between gap-2 pr-6">
          <h3 className="break-words text-base font-semibold text-slate-900 leading-snug">
            {task.name}
          </h3>
          <div className={`mt-1.5 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
           <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium shadow-sm ${typeContent.style}`}>
             <span className="text-sm">{typeContent.icon}</span>
             <span>{task.type}</span>
           </span>
           
           <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium shadow-sm ${priorityStyles[task.priority] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
             {getPriorityIcon(task.priority)}
             <span>{task.priority}</span>
           </span>
        </div>
      </div>

      {/* Description */}
      {task?.description && (
        <div className={`text-sm text-slate-600 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
          {renderDescription(task.description)}
        </div>
      )}

      {/* Expanded Details - Subtasks List */}
      {isExpanded && task?.subtasks && task.subtasks.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 mt-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Subtasks</span>
          <div className="space-y-1.5">
            {task.subtasks.map((subtask) => (
              <div 
                key={subtask.id} 
                className="flex items-center gap-2 group/subtask"
                onClick={(e) => {
                   e.stopPropagation();
                   handleToggleSubtask(subtask.id);
                }}
              >
                <div className={`h-4 w-4 rounded border transition-colors flex items-center justify-center ${subtask.isCompleted ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300 group-hover/subtask:border-blue-400'}`}>
                  {subtask.isCompleted && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-xs ${subtask.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar (Always show if subtasks exist) */}
      {task?.subtasks && task.subtasks.length > 0 && (
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
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
            {task.subtasks.filter((t) => t?.isCompleted).length}/{task.subtasks.length}
          </span>
        </div>
      )}

      {/* Metadata Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
         {dueDateStatus ? (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
              getDueDateBadgeColor(dueDateStatus.status)
            }`}
            title={formatDate(task.dueDate)}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {dueDateStatus.text}
          </span>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3 text-xs text-slate-500 ml-auto">
          {task.difficulty && (
             <span className="font-medium text-slate-500">
               {task.difficulty}
             </span>
          )}
          
          {task.estimatedTime && (
            <span className="flex items-center gap-1" title="Estimated Time">
              <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {task.estimatedTime}
            </span>
          )}
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute top-3 right-8 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          className="rounded-md p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600 bg-white/80 backdrop-blur-sm shadow-sm ring-1 ring-slate-200"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setDraft(buildDraft(task));
            setIsEditing(true);
          }}
          aria-label="Edit"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 bg-white/80 backdrop-blur-sm shadow-sm ring-1 ring-slate-200"
          type="button"
          onClick={(e) => {
             e.stopPropagation();
             onDeleteTask(task.id, columnId);
          }}
          aria-label="Delete"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </article>
  )
}

export default TaskCard