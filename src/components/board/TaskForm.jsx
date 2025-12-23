import { useState } from 'react'
import { boardUsers, priorities } from '../../data/boardData'
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
      <button
        className="rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900"
        type="submit"
      >
        Add task
      </button>
    </form>
  )
}

export default TaskForm
