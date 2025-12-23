import { boardUsers, priorities, taskTypes } from '../../data/boardData'

function TaskForm({ columnId, draft, onAddTask, onUpdateDraft }) {
  return (
    <form
      className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4"
      onSubmit={(event) => onAddTask(event, columnId)}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Add task
      </p>
      <input
        className="border border-slate-200 px-2 py-1 text-xs outline-none"
        value={draft.name}
        onChange={(event) => onUpdateDraft(columnId, 'name', event.target.value)}
        placeholder="Task name"
      />
      <textarea
        className="min-h-[64px] resize-none border border-slate-200 px-2 py-1 text-xs outline-none"
        value={draft.description}
        onChange={(event) =>
          onUpdateDraft(columnId, 'description', event.target.value)
        }
        placeholder="Short description"
      />
      <select
        className="border border-slate-200 px-2 py-1 text-xs outline-none"
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
        <select
          className="flex-1 border border-slate-200 px-2 py-1 text-xs outline-none"
          value={draft.type}
          onChange={(event) => onUpdateDraft(columnId, 'type', event.target.value)}
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
        className="border border-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-wide"
        type="submit"
      >
        Add task
      </button>
    </form>
  )
}

export default TaskForm
