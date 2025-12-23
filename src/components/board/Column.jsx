import TaskCard from './TaskCard'
import TaskForm from './TaskForm'

function Column({
  column,
  draft,
  columns,
  onDeleteColumn,
  onDeleteTask,
  onMoveTask,
  onAddTask,
  onUpdateDraft,
  onUpdateTask,
}) {
  const handleDrop = (event) => {
    event.preventDefault()
    const payload =
      event.dataTransfer.getData('application/json') ||
      event.dataTransfer.getData('text/plain')
    if (!payload) return

    try {
      const data =
        payload.trim().startsWith('{') ? JSON.parse(payload) : { taskId: payload }
      if (!data.taskId || !data.columnId) return
      if (data.columnId === column.id) return
      onMoveTask(data.taskId, data.columnId, column.id)
    } catch {
      // Ignore invalid drag payloads.
    }
  }

  return (
    <section
      className="min-w-[260px] flex-1 border border-slate-200 p-4"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {column.name}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{column.tasks.length}</span>
          <button
            className="rounded-full border border-red-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-red-500 hover:border-red-300 hover:bg-red-50"
            type="button"
            onClick={() => onDeleteColumn(column.id)}
            aria-label={`Delete ${column.name} column`}
          >
            Delete column
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columnId={column.id}
            columns={columns}
            onMoveTask={onMoveTask}
            onDeleteTask={onDeleteTask}
            onUpdateTask={onUpdateTask}
            isDone={column.name.toLowerCase() === 'done'}
          />
        ))}
      </div>

      <TaskForm
        columnId={column.id}
        draft={draft}
        onAddTask={onAddTask}
        onUpdateDraft={onUpdateDraft}
      />
    </section>
  )
}

export default Column
