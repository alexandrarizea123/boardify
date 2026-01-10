import { useRef, useState } from 'react'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoltIcon,
  BugAntIcon,
  CheckIcon,
  MinusIcon,
  SparklesIcon,
  TagIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { boardUsers, priorities, difficulties, createId } from '../../data/boardData'
import MentionTextarea from '../mentions/MentionTextarea'
import { formatDate, getDueDateStatus } from '../../utils/date'

const buildDraft = (task) => ({
  name: task.name,
  description: task.description,
  assignee: task.assignee,
  type: task.type || 'Feature',
  sprint: task.sprint || '',
  priority: task.priority || '',
  difficulty: task.difficulty || '',
  estimatedTime: task.estimatedTime || '',
  dueDate: task.dueDate || '',
  subtasks: task.subtasks ? [...task.subtasks] : [],
  projectTags: task.projectTags ? [...task.projectTags] : [],
  dependencies: task.dependencies ? [...task.dependencies] : [],
})

const getTypeContent = (type) => {
  switch (type) {
    case 'Feature':
      return {
        icon: SparklesIcon,
        className: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      }
    case 'Bug':
      return {
        icon: BugAntIcon,
        className: 'text-rose-600 bg-rose-50 border-rose-100',
      }
    case 'Research':
      return {
        icon: TagIcon,
        className: 'text-violet-600 bg-violet-50 border-violet-100',
      }
    default:
      return {
        icon: TagIcon,
        className: 'text-slate-600 bg-slate-50 border-slate-100',
      }
  }
}

const getPriorityIcon = (priority) => {
  switch (priority) {
    case 'Highest':
      return { icon: ArrowUpIcon, className: 'text-red-500' }
    case 'High':
      return { icon: ArrowUpIcon, className: 'text-orange-500' }
    case 'Medium':
      return { icon: MinusIcon, className: 'text-amber-500' }
    case 'Low':
      return { icon: ArrowDownIcon, className: 'text-slate-400' }
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
  taskTypes,
  sprints = [],
  projectTagOptions = [],
  dependencyOptions = [],
  onAddType,
  onAddSprint,
  onDeleteTask,
  isDone = false,
  onUpdateTask,
}) {
  const dueDateStatus = getDueDateStatus(task.dueDate)
  const [isEditing, setIsEditing] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [draft, setDraft] = useState(() => buildDraft(task))
  const [isAddingType, setIsAddingType] = useState(false)
  const [newTypeValue, setNewTypeValue] = useState('')
  const [isAddingSprint, setIsAddingSprint] = useState(false)
  const [newSprintValue, setNewSprintValue] = useState('')
  const [newSubtaskName, setNewSubtaskName] = useState('')
  const [newProjectTag, setNewProjectTag] = useState('')
  const [selectedDependencyId, setSelectedDependencyId] = useState('')
  const isDraggingRef = useRef(false)
  const canDrag =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: fine)').matches

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

  const handleSprintChange = (event) => {
    const value = event.target.value
    if (value === '__new__') {
      setIsAddingSprint(true)
      setNewSprintValue('')
    } else {
      handleDraftChange('sprint', value)
    }
  }

  const handleNewSprintSubmit = () => {
    const trimmed = newSprintValue.trim()
    if (trimmed) {
      if (typeof onAddSprint === 'function') {
        onAddSprint(trimmed)
      }
      handleDraftChange('sprint', trimmed)
    }
    setIsAddingSprint(false)
    setNewSprintValue('')
  }

  const handleNewSprintKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleNewSprintSubmit()
    } else if (event.key === 'Escape') {
      setIsAddingSprint(false)
      setNewSprintValue('')
    }
  }

  const handleAddProjectTag = () => {
    const trimmed = newProjectTag.trim()
    if (!trimmed) return
    const currentTags = draft.projectTags || []
    if (currentTags.includes(trimmed)) {
      setNewProjectTag('')
      return
    }
    handleDraftChange('projectTags', [...currentTags, trimmed])
    setNewProjectTag('')
  }

  const handleRemoveProjectTag = (tagToRemove) => {
    const currentTags = draft.projectTags || []
    handleDraftChange(
      'projectTags',
      currentTags.filter((tag) => tag !== tagToRemove),
    )
  }

  const handleProjectTagKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddProjectTag()
    }
  }

  const handleAddDependency = () => {
    if (!selectedDependencyId) return
    const currentDependencies = draft.dependencies || []
    if (currentDependencies.some((dep) => dep.id === selectedDependencyId)) {
      setSelectedDependencyId('')
      return
    }
    const dependency = dependencyOptions.find(
      (option) => option.id === selectedDependencyId,
    )
    if (!dependency) return
    handleDraftChange('dependencies', [
      ...currentDependencies,
      { id: dependency.id, name: dependency.name },
    ])
    setSelectedDependencyId('')
  }

  const handleRemoveDependency = (dependencyId) => {
    const currentDependencies = draft.dependencies || []
    handleDraftChange(
      'dependencies',
      currentDependencies.filter((dep) => dep.id !== dependencyId),
    )
  }

  const handleSave = () => {
    if (!draft.name.trim()) return
    const updates = {
      name: draft.name.trim(),
      description: draft.description.trim(),
      assignee: draft.assignee,
      type: draft.type,
      sprint: draft.sprint,
      priority: draft.priority,
      estimatedTime: draft.estimatedTime,
      dueDate: draft.dueDate,
      subtasks: draft.subtasks,
      projectTags: draft.projectTags || [],
      dependencies: draft.dependencies || [],
    }
    if (draft.difficulty) {
      updates.difficulty = draft.difficulty
    }
    onUpdateTask(task.id, columnId, updates)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setDraft(buildDraft(task))
    setIsEditing(false)
    setIsAddingType(false)
    setNewTypeValue('')
    setIsAddingSprint(false)
    setNewSprintValue('')
    setNewProjectTag('')
    setSelectedDependencyId('')
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
            className="inline-block max-w-full break-all rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700"
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
      'bg-red-100 text-red-600 ring-red-50',
      'bg-orange-100 text-orange-600 ring-orange-50',
      'bg-amber-100 text-amber-600 ring-amber-50',
      'bg-emerald-100 text-emerald-600 ring-emerald-50',
      'bg-cyan-100 text-cyan-600 ring-cyan-50',
      'bg-blue-100 text-blue-600 ring-blue-50',
      'bg-indigo-100 text-indigo-600 ring-indigo-50',
      'bg-violet-100 text-violet-600 ring-violet-50',
      'bg-fuchsia-100 text-fuchsia-600 ring-fuchsia-50',
      'bg-pink-100 text-pink-600 ring-pink-50',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const availableDependencies = dependencyOptions.filter(
    (option) =>
      option.id !== task.id &&
      !(draft.dependencies || []).some((dep) => dep.id === option.id),
  )

  if (isEditing) {
    return (
      <article className="glass-card flex flex-col gap-4 rounded-xl p-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900">Edit Task</h3>
        </div>
        <input
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          value={draft.name}
          onChange={(event) => handleDraftChange('name', event.target.value)}
          placeholder="Task name"
          autoFocus
        />
        <MentionTextarea
          className="min-h-20 resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
          value={draft.description}
          onChange={(value) => handleDraftChange('description', value)}
          users={boardUsers}
          placeholder="Add a description... (use @ to mention)"
        />

        {/* Subtasks Edit */}
        <div className="space-y-2">
          {draft.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none transition-all focus:border-indigo-500 focus:bg-white"
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
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none transition-all focus:border-indigo-500 focus:bg-white"
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              onClick={handleAddSubtask}
            >
              Add
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
            type="button"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
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
  const priorityIcon = getPriorityIcon(task.priority)
  const TypeIcon = typeContent.icon
  const PriorityIcon = priorityIcon?.icon

  return (
    <article
      className={`group relative flex flex-col gap-3 rounded-xl border bg-white p-4 pr-10 shadow-card transition-all duration-300 cursor-pointer 
      ${isDone ? 'opacity-70 bg-slate-50/50' : 'hover:-translate-y-1 hover:shadow-card-hover hover:border-indigo-200/50'}
      ${isExpanded ? 'ring-2 ring-indigo-500/20 shadow-md z-10' : 'border-slate-200'}`}
      draggable={canDrag}
      onClick={(e) => {
        if (e.defaultPrevented) return
        if (isDraggingRef.current) {
          isDraggingRef.current = false
        }
      }}
      onDragStart={
        canDrag
          ? (event) => {
            isDraggingRef.current = true
            event.dataTransfer.setData(
              'application/json',
              JSON.stringify({ taskId: task.id, columnId }),
            )
            event.dataTransfer.setData('text/plain', task.id)
            event.dataTransfer.effectAllowed = 'move'
            // Add a tilt effect
            event.currentTarget.classList.add('rotate-3', 'scale-105', 'opacity-90')
          }
          : undefined
      }
      onDragEnd={
        canDrag
          ? (event) => {
            isDraggingRef.current = false
            event.currentTarget.classList.remove('rotate-3', 'scale-105', 'opacity-90')
          }
          : undefined
      }
    >
      <div className="flex flex-col gap-3">
        {/* Header Row: Type & Title */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <span className={`flex items-center justify-center p-1 rounded-md border text-[10px] uppercase font-bold tracking-wider ${typeContent.className}`}>
              {task.type || 'Task'}
            </span>
          </div>
          <h3 className={`text-[15px] font-bold leading-snug text-slate-900 flex-1 break-words ${isDone ? 'line-through text-slate-500' : ''}`}>
            {task.name}
          </h3>
        </div>

        {/* Expand Toggle */}
        <button
          className={`absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-all ${isExpanded ? 'rotate-180 bg-slate-100 text-indigo-600' : ''}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(!isExpanded)
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Description Snippet */}
        {(task.description || isExpanded) && (
          <div className={`text-sm text-slate-600 leading-relaxed break-words ${isExpanded ? '' : 'line-clamp-2'}`}>
            {renderDescription(task.description)}
          </div>
        )}

        {/* Metadata Row: Sprint, Tags, Assignee */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {task.sprint && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
              <ClockIcon className="w-3 h-3" />
              {task.sprint}
            </span>
          )}
          {(task.projectTags || []).map(tag => (
            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
              #{tag}
            </span>
          ))}

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Assignee Avatar */}
          {task.assignee && (
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold shadow-sm ring-2 ring-white ${getAvatarColor(task.assignee)}`}
              title={task.assignee}
            >
              {getInitials(task.assignee)}
            </div>
          )}
        </div>

        {/* Footer Row: Priority, Due Date, Subtasks */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 mt-1">
          {PriorityIcon && (
            <div className="flex items-center gap-1 text-slate-500" title={`Priority: ${task.priority}`}>
              <PriorityIcon className={`w-4 h-4 ${getPriorityIcon(task.priority)?.className || ''}`} />
              {isExpanded && <span className="text-[10px] font-semibold">{task.priority}</span>}
            </div>
          )}

          {task.dueDate && (
            <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${getDueDateBadgeColor(dueDateStatus)}`}>
              <CalendarIcon className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </div>
          )}

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 ml-auto bg-slate-50 px-2 py-0.5 rounded-full">
              <CheckIcon className="w-3 h-3" />
              {task.subtasks.filter(t => t.isCompleted).length}/{task.subtasks.length}
            </div>
          )}
        </div>

        {/* Edit Actions Hover */}
        <div className="absolute top-2 right-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              setDraft(buildDraft(task))
              setIsEditing(true)
            }}
          >

            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}

export default TaskCard
