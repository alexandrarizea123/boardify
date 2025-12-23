import { useState } from 'react'
import { boardUsers, priorities, difficulties, createId } from '../../data/boardData'
import MentionTextarea from '../mentions/MentionTextarea'

function TaskForm({
  columnId,
  draft,
  taskTypes,
  onAddType,
  onAddTask,
  onUpdateDraft,
}) {
  const [isAddingType, setIsAddingType] = useState(false)
  const [newTypeValue, setNewTypeValue] = useState('')
  const [newSubtaskName, setNewSubtaskName] = useState('')

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

  return (
    <form
      className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3"
      onSubmit={(event) => onAddTask(event, columnId)}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        Add task
      </p>
      <input
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
        value={draft.name}
        onChange={(event) => onUpdateDraft(columnId, 'name', event.target.value)}
        placeholder="Task name"
      />
      <MentionTextarea
        className="min-h-[64px] resize-none rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
        value={draft.description}
        onChange={(value) => onUpdateDraft(columnId, 'description', value)}
        users={boardUsers}
        placeholder="Short description"
      />
      
      <div className="space-y-2">
        {(draft.subtasks || []).map((subtask) => (
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

      <select
        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
        value={draft.assignee}
        onChange={(event) =>
          onUpdateDraft(columnId, 'assignee', event.target.value)
        }
      >
        {boardUsers.map((user) => (
          <option key={user} value={user}>
            {user}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-2">
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
            className="min-w-[120px] flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
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
          className="min-w-[120px] flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
          value={draft.priority}
          onChange={(event) =>
            onUpdateDraft(columnId, 'priority', event.target.value)
          }
        >
          {priorities.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          className="min-w-[120px] flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
          value={draft.difficulty}
          onChange={(event) =>
            onUpdateDraft(columnId, 'difficulty', event.target.value)
          }
        >
          {difficulties.map((difficulty) => (
            <option key={difficulty} value={difficulty}>
              {difficulty}
            </option>
          ))}
        </select>
        <input
          className="min-w-[120px] flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
          value={draft.estimatedTime}
          onChange={(event) =>
            onUpdateDraft(columnId, 'estimatedTime', event.target.value)
          }
          placeholder="Est. time (e.g. 2h)"
        />
        <input
          type="date"
          className="min-w-[120px] flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-slate-300"
          value={draft.dueDate}
          onChange={(event) =>
            onUpdateDraft(columnId, 'dueDate', event.target.value)
          }
        />
      </div>
      <button
        className="w-fit self-end rounded-md border border-slate-300 bg-slate-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-900"
        type="submit"
      >
        Add task
      </button>
    </form>
  )
}

export default TaskForm
