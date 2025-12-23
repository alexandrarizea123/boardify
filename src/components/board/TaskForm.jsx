import { boardUsers, priorities, taskTypes } from '../../data/boardData'
import MentionTextarea from '../mentions/MentionTextarea'

function TaskForm({ columnId, draft, onAddTask, onUpdateDraft }) {
  return (
    <form
      className="mt-3 flex flex-col gap-2 border-t border-[var(--color-tea-green-200)] pt-3"
      onSubmit={(event) => onAddTask(event, columnId)}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-tea-green-600)]">
        Add task
      </p>
      <input
        className="rounded-lg border border-[var(--color-tea-green-200)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-tea-green-400)]"
        value={draft.name}
        onChange={(event) => onUpdateDraft(columnId, 'name', event.target.value)}
        placeholder="Task name"
      />
      <MentionTextarea
        className="min-h-[64px] resize-none rounded-lg border border-[var(--color-tea-green-200)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-tea-green-400)]"
        value={draft.description}
        onChange={(value) => onUpdateDraft(columnId, 'description', value)}
        users={boardUsers}
        placeholder="Short description"
      />
      <select
        className="rounded-lg border border-[var(--color-tea-green-200)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-tea-green-400)]"
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
          className="flex-1 rounded-lg border border-[var(--color-tea-green-200)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-tea-green-400)]"
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
          className="flex-1 rounded-lg border border-[var(--color-tea-green-200)] bg-white px-2 py-1 text-xs outline-none focus:border-[var(--color-tea-green-400)]"
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
        className="rounded-full border border-[var(--color-tea-green-700)] bg-[var(--color-tea-green-600)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-tea-green-50)]"
        type="submit"
      >
        Add task
      </button>
    </form>
  )
}

export default TaskForm
