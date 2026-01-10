import { useState } from 'react'
import { boardUsers, priorities, createId } from '../../data/boardData'
import MentionTextarea from '../mentions/MentionTextarea'
import {
  CalendarIcon,
  ClockIcon,
  TagIcon,
  UserCircleIcon,
  FlagIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

const InputGroup = ({ icon: IconComponent, children }) => (
  <div className="relative">
    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
      <IconComponent className="h-4 w-4" />
    </div>
    {children}
  </div>
)

function TaskForm({
  columnId,
  draft,
  taskTypes,
  sprints = [],
  assignees = [],
  projectTagOptions = [],
  dependencyOptions = [],
  onAddType,
  onAddSprint,
  onAddTask,
  onUpdateDraft,
}) {
  const [isAddingType, setIsAddingType] = useState(false)
  const [newTypeValue, setNewTypeValue] = useState('')
  const [isAddingSprint, setIsAddingSprint] = useState(false)
  const [newSprintValue, setNewSprintValue] = useState('')
  const [newSubtaskName, setNewSubtaskName] = useState('')
  const [newProjectTag, setNewProjectTag] = useState('')
  const [selectedDependencyId, setSelectedDependencyId] = useState('')

  const availableDependencies = dependencyOptions.filter(
    (option) => !(draft.dependencies || []).some((dep) => dep.id === option.id),
  )

  // Use passed assignees or fallback to default imported users if empty
  const taskAssignees = assignees.length > 0 ? assignees : boardUsers

  const handleTypeChange = (event) => {
    const value = event.target.value
    if (value === '__new__') {
      setIsAddingType(true)
      setNewTypeValue('')
    } else {
      onUpdateDraft(columnId, 'type', value)
    }
  }

  const handleNewTypeSubmit = () => {
    const trimmed = newTypeValue.trim()
    if (trimmed) {
      onAddType(trimmed)
      onUpdateDraft(columnId, 'type', trimmed)
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
      onUpdateDraft(columnId, 'sprint', value)
    }
  }

  const handleNewSprintSubmit = () => {
    const trimmed = newSprintValue.trim()
    if (trimmed) {
      if (typeof onAddSprint === 'function') {
        onAddSprint(trimmed)
      }
      onUpdateDraft(columnId, 'sprint', trimmed)
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

  const handleAddSubtask = () => {
    const trimmed = newSubtaskName.trim()
    if (!trimmed) return
    const newSubtask = { id: createId(), title: trimmed, isCompleted: false }
    const currentSubtasks = draft.subtasks || []
    onUpdateDraft(columnId, 'subtasks', [...currentSubtasks, newSubtask])
    setNewSubtaskName('')
  }

  const handleRemoveSubtask = (subtaskId) => {
    const currentSubtasks = draft.subtasks || []
    onUpdateDraft(
      columnId,
      'subtasks',
      currentSubtasks.filter((t) => t.id !== subtaskId)
    )
  }

  const handleSubtaskNameChange = (subtaskId, newName) => {
    const currentSubtasks = draft.subtasks || []
    onUpdateDraft(
      columnId,
      'subtasks',
      currentSubtasks.map((t) =>
        t.id === subtaskId ? { ...t, title: newName } : t
      )
    )
  }

  const handleAddProjectTag = () => {
    const trimmed = newProjectTag.trim()
    if (!trimmed) return
    const currentTags = draft.projectTags || []
    if (currentTags.includes(trimmed)) {
      setNewProjectTag('')
      return
    }
    onUpdateDraft(columnId, 'projectTags', [...currentTags, trimmed])
    setNewProjectTag('')
  }

  const handleRemoveProjectTag = (tagToRemove) => {
    const currentTags = draft.projectTags || []
    onUpdateDraft(
      columnId,
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
    onUpdateDraft(columnId, 'dependencies', [
      ...currentDependencies,
      { id: dependency.id, name: dependency.name },
    ])
    setSelectedDependencyId('')
  }

  const handleRemoveDependency = (dependencyId) => {
    const currentDependencies = draft.dependencies || []
    onUpdateDraft(
      columnId,
      'dependencies',
      currentDependencies.filter((dep) => dep.id !== dependencyId),
    )
  }



  const selectClasses = "w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-2.5 text-xs font-medium outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 cursor-pointer text-slate-600"
  const inputClasses = "w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-xs font-medium outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-slate-600"

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => onAddTask(event, columnId)}
    >
      <div className="space-y-4">
        <input
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg font-bold text-slate-900 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-300"
          value={draft.name}
          onChange={(event) => onUpdateDraft(columnId, 'name', event.target.value)}
          placeholder="What needs to be done?"
          autoFocus
        />

        <MentionTextarea
          className="min-h-[80px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400"
          value={draft.description}
          onChange={(value) => onUpdateDraft(columnId, 'description', value)}
          users={boardUsers}
          placeholder="Add a description... (Type @ to mention teammates)"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Details</h4>
          <div className="space-y-3">
            <InputGroup icon={UserCircleIcon}>
              <select
                className={selectClasses}
                value={draft.assignee || ''}
                onChange={(event) => onUpdateDraft(columnId, 'assignee', event.target.value)}
              >
                <option value="">Unassigned</option>
                {taskAssignees.map((user) => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </InputGroup>

            <InputGroup icon={ClockIcon}>
              {isAddingSprint ? (
                <input
                  className={inputClasses}
                  value={newSprintValue}
                  onChange={(event) => setNewSprintValue(event.target.value)}
                  onBlur={handleNewSprintSubmit}
                  onKeyDown={handleNewSprintKeyDown}
                  placeholder="Sprint name..."
                  autoFocus
                />
              ) : (
                <select
                  className={selectClasses}
                  value={draft.sprint || ''}
                  onChange={handleSprintChange}
                >
                  <option value="">Sprint</option>
                  {sprints.map((sprint) => (
                    <option key={sprint} value={sprint}>{sprint}</option>
                  ))}
                  <option value="__new__" className="font-bold text-indigo-600">+ New sprint</option>
                </select>
              )}
            </InputGroup>

            <InputGroup icon={FlagIcon}>
              <select
                className={selectClasses}
                value={draft.priority || ''}
                onChange={(event) => onUpdateDraft(columnId, 'priority', event.target.value)}
              >
                <option value="" disabled>Priority</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </InputGroup>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Properties</h4>
          <div className="space-y-3">
            <InputGroup icon={ChartBarIcon}>
              {isAddingType ? (
                <input
                  className={inputClasses}
                  value={newTypeValue}
                  onChange={(e) => setNewTypeValue(e.target.value)}
                  onBlur={handleNewTypeSubmit}
                  onKeyDown={handleNewTypeKeyDown}
                  placeholder="Type name..."
                  autoFocus
                />
              ) : (
                <select
                  className={selectClasses}
                  value={draft.type || ''}
                  onChange={handleTypeChange}
                >
                  <option value="" disabled>Type</option>
                  {taskTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  <option value="__new__" className="font-bold text-indigo-600">+ New type</option>
                </select>
              )}
            </InputGroup>

            <InputGroup icon={CalendarIcon}>
              <input
                type="date"
                className={inputClasses}
                value={draft.dueDate}
                onChange={(event) => onUpdateDraft(columnId, 'dueDate', event.target.value)}
              />
            </InputGroup>

            <InputGroup icon={TagIcon}>
              <input
                className={inputClasses}
                value={draft.estimatedTime}
                onChange={(event) => onUpdateDraft(columnId, 'estimatedTime', event.target.value)}
                placeholder="Est. time (e.g. 2h)"
              />
            </InputGroup>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Subtasks */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Subtasks</h4>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">{(draft.subtasks || []).length}</span>
            </div>
            <div className="space-y-2">
              {(draft.subtasks || []).map((subtask) => (
                <div key={subtask.id} className="group flex gap-2">
                  <input
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none transition-all focus:border-indigo-500"
                    value={subtask.title}
                    onChange={(e) => handleSubtaskNameChange(subtask.id, e.target.value)}
                  />
                  <button
                    type="button"
                    className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                    onClick={() => handleRemoveSubtask(subtask.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none transition-all focus:border-indigo-500"
                  value={newSubtaskName}
                  onChange={(e) => setNewSubtaskName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddSubtask()
                    }
                  }}
                  placeholder="Add subtask"
                />
                <button
                  type="button"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                  onClick={handleAddSubtask}
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tags & Dependencies */}
          <div className="space-y-4">
            {/* Tags */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Tags</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {(draft.projectTags || []).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600">
                    #{tag}
                    <button type="button" className="hover:text-red-500 ml-1" onClick={() => handleRemoveProjectTag(tag)}>✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none transition-all focus:border-indigo-500"
                  value={newProjectTag}
                  onChange={(e) => setNewProjectTag(e.target.value)}
                  onKeyDown={handleProjectTagKeyDown}
                  placeholder="Add tag"
                  list={`project-tags-${columnId}`}
                />
                <button
                  type="button"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                  onClick={handleAddProjectTag}
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
              {projectTagOptions.length > 0 && (
                <datalist id={`project-tags-${columnId}`}>
                  {projectTagOptions.map(tag => <option key={tag} value={tag} />)}
                </datalist>
              )}
            </div>

            {/* Dependencies */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Dependencies</h4>
              <div className="flex flex-wrap gap-2 mb-2">
                {(draft.dependencies || []).map((dep) => (
                  <span key={dep.id} className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                    {dep.name}
                    <button type="button" className="hover:text-red-500 ml-1" onClick={() => handleRemoveDependency(dep.id)}>✕</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <select
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none transition-all focus:border-indigo-500"
                  value={selectedDependencyId}
                  onChange={(e) => setSelectedDependencyId(e.target.value)}
                  disabled={availableDependencies.length === 0}
                >
                  <option value="">Select task</option>
                  {availableDependencies.map(task => (
                    <option key={task.id} value={task.id}>{task.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors disabled:opacity-50"
                  onClick={handleAddDependency}
                  disabled={!selectedDependencyId}
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <button
          className="rounded-xl bg-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:-translate-y-0.5"
          type="submit"
        >
          Create Task
        </button>
      </div>
    </form>
  )
}

export default TaskForm
