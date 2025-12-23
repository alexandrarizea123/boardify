import { formatDate } from '../../utils/date'

function TaskCard({ task, columnId, columns, onMoveTask, onDeleteTask }) {
  return (
    <article className="flex flex-col gap-2 border border-slate-200 p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{task.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-slate-400">
            {task.priority}
          </span>
          <button
            className="text-[10px] uppercase tracking-wide text-slate-400 hover:text-slate-700"
            type="button"
            onClick={() => onDeleteTask(task.id, columnId)}
          >
            Delete
          </button>
        </div>
      </div>
      {task.description && (
        <p className="text-xs text-slate-500">{task.description}</p>
      )}
      <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
        <span>Type: {task.type}</span>
        <span>Assignee: {task.assignee}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
        <span>Created {formatDate(task.createdAt)}</span>
        <span>Updated {formatDate(task.updatedAt)}</span>
      </div>
      <label className="text-[10px] uppercase tracking-wide text-slate-400">
        Move to
        <select
          className="mt-1 w-full border border-slate-200 px-2 py-1 text-xs outline-none"
          value={columnId}
          onChange={(event) =>
            onMoveTask(task.id, columnId, event.target.value)
          }
        >
          {columns.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
    </article>
  )
}

export default TaskCard
