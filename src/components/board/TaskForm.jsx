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
      className="flex flex-col gap-3 pt-1"
      onSubmit={(event) => onAddTask(event, columnId)}
    >
      <input
        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
        value={draft.name}
        onChange={(event) => onUpdateDraft(columnId, 'name', event.target.value)}
        placeholder="Task name"
        autoFocus
      />
      <MentionTextarea
        className="min-h-[80px] resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all"
        value={draft.description}
        onChange={(value) => onUpdateDraft(columnId, 'description', value)}
        users={boardUsers}
        placeholder="Add a description... (use @ to mention)"
      />
      
      <div className="space-y-2">
        {(draft.subtasks || []).map((subtask) => (
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
          value={draft.assignee || ''}
          onChange={(event) =>
            onUpdateDraft(columnId, 'assignee', event.target.value)
          }
        >
          <option value="" disabled>
            Select assignee
          </option>
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
            placeholder="Type name..."
            autoFocus
          />
        ) : (
          <select
            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
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
          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
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
          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
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
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
          value={draft.estimatedTime}
          onChange={(event) =>
            onUpdateDraft(columnId, 'estimatedTime', event.target.value)
          }
          placeholder="Est. time (e.g. 2h)"
        />
        <input
          type="date"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none focus:border-blue-500 focus:bg-white transition-all"
          value={draft.dueDate}
          onChange={(event) =>
            onUpdateDraft(columnId, 'dueDate', event.target.value)
          }
        />
      </div>

      <button
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        type="submit"
      >
        Create Task
      </button>
    </form>
  )
}

export default TaskForm
