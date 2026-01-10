import { useState } from 'react'
import { boardUsers, priorities, difficulties, createId } from '../../data/boardData'
import MentionTextarea from '../mentions/MentionTextarea'

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

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => onAddTask(event, columnId)}
    >
      <input
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
        value={draft.name}
        onChange={(event) => onUpdateDraft(columnId, 'name', event.target.value)}
        placeholder="Task name"
        autoFocus
      />

      <div className="grid gap-2 md:grid-cols-[1.2fr,0.9fr]">
        <MentionTextarea
          className="min-h-[64px] resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          value={draft.description}
          onChange={(value) => onUpdateDraft(columnId, 'description', value)}
          users={boardUsers}
          placeholder="Add a short description..."
        />
        <div className="space-y-2">
          {isAddingSprint ? (
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white"
              value={newSprintValue}
              onChange={(event) => setNewSprintValue(event.target.value)}
              onBlur={handleNewSprintSubmit}
              onKeyDown={handleNewSprintKeyDown}
              placeholder="Sprint name..."
              autoFocus
            />
          ) : (
            <select
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white"
              value={draft.sprint || ''}
              onChange={handleSprintChange}
            >
              <option value="">
                Sprint
              </option>
              {sprints.map((sprint) => (
                <option key={sprint} value={sprint}>
                  {sprint}
                </option>
              ))}
              <option value="__new__" className="font-semibold text-slate-500">
                + New sprint
              </option>
            </select>
          )}

          <select
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white"
            value={draft.assignee || ''}
            onChange={(event) =>
              onUpdateDraft(columnId, 'assignee', event.target.value)
            }
          >
            <option value="">
              Unassigned
            </option>
            {taskAssignees.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        {isAddingType ? (
          <input
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white"
            value={newTypeValue}
            onChange={(e) => setNewTypeValue(e.target.value)}
            onBlur={handleNewTypeSubmit}
            onKeyDown={handleNewTypeKeyDown}
            placeholder="Type name..."
            autoFocus
          />
        ) : (
          <select
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white"
            value={draft.type || ''}
            onChange={handleTypeChange}
          >
            <option value="" disabled>
              Select type
            </option>
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
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white"
          value={draft.priority || ''}
          onChange={(event) =>
            onUpdateDraft(columnId, 'priority', event.target.value)
          }
        >
          <option value="" disabled>
            Select priority
          </option>
          {priorities.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>

        <select
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white"
          value={draft.difficulty || ''}
          onChange={(event) =>
            onUpdateDraft(columnId, 'difficulty', event.target.value)
          }
        >
          <option value="" disabled>
            Select difficulty
          </option>
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>

        <input
          className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white"
          value={draft.estimatedTime}
          onChange={(event) =>
            onUpdateDraft(columnId, 'estimatedTime', event.target.value)
          }
          placeholder="Est. time"
        />
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <input
          type="date"
          className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white"
          value={draft.dueDate}
          onChange={(event) =>
            onUpdateDraft(columnId, 'dueDate', event.target.value)
          }
        />
      </div>

      <details className="rounded-xl border border-slate-200 bg-white px-3 py-2" open={(draft.subtasks || []).length > 0}>
        <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-700 list-none">
          Subtasks
          <span className="text-[10px] font-semibold text-slate-400">
            {(draft.subtasks || []).length}
          </span>
        </summary>
        <div className="mt-2 space-y-2">
          {(draft.subtasks || []).map((subtask) => (
            <div key={subtask.id} className="flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white"
                value={subtask.title}
                onChange={(e) =>
                  handleSubtaskNameChange(subtask.id, e.target.value)
                }
                placeholder="Subtask name"
              />
              <button
                type="button"
                className="text-slate-400 transition-colors hover:text-red-500"
                onClick={() => handleRemoveSubtask(subtask.id)}
              >
                ✕
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white"
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              onClick={handleAddSubtask}
            >
              Add
            </button>
          </div>
        </div>
      </details>

      <details className="rounded-xl border border-slate-200 bg-white px-3 py-2" open={(draft.projectTags || []).length > 0}>
        <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-700 list-none">
          Project tags
          <span className="text-[10px] font-semibold text-slate-400">
            {(draft.projectTags || []).length}
          </span>
        </summary>
        <div className="mt-2 space-y-2">
          {(draft.projectTags || []).length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {(draft.projectTags || []).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                >
                  #{tag}
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => handleRemoveProjectTag(tag)}
                    aria-label={`Remove ${tag}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <input
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white"
              value={newProjectTag}
              onChange={(event) => setNewProjectTag(event.target.value)}
              onKeyDown={handleProjectTagKeyDown}
              placeholder="Add project tag"
              list={`project-tags-${columnId}`}
            />
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              onClick={handleAddProjectTag}
            >
              Add
            </button>
          </div>
          {projectTagOptions.length > 0 ? (
            <datalist id={`project-tags-${columnId}`}>
              {projectTagOptions.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
          ) : null}
        </div>
      </details>

      <details className="rounded-xl border border-slate-200 bg-white px-3 py-2" open={(draft.dependencies || []).length > 0}>
        <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-700 list-none">
          Dependencies
          <span className="text-[10px] font-semibold text-slate-400">
            {(draft.dependencies || []).length}
          </span>
        </summary>
        <div className="mt-2 space-y-2">
          {(draft.dependencies || []).length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {(draft.dependencies || []).map((dependency) => (
                <span
                  key={dependency.id}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                >
                  {dependency.name}
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => handleRemoveDependency(dependency.id)}
                    aria-label={`Remove ${dependency.name}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <select
              className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none transition-all focus:border-blue-500 focus:bg-white"
              value={selectedDependencyId}
              onChange={(event) => setSelectedDependencyId(event.target.value)}
              disabled={availableDependencies.length === 0}
            >
              <option value="">
                {availableDependencies.length === 0 ? 'No tasks yet' : 'Select task'}
              </option>
              {availableDependencies.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name} · {task.column}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
              onClick={handleAddDependency}
              disabled={!selectedDependencyId}
            >
              Add
            </button>
          </div>
        </div>
      </details>

      <div className="flex justify-end pt-2">
        <button
          className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
          type="submit"
        >
          Create Task
        </button>
      </div>
    </form>
  )
}

export default TaskForm
