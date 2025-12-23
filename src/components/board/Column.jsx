import TaskCard from './TaskCard'
import TaskForm from './TaskForm'

function Column({
  column,
  draft,
  columns,
  taskTypes,
  onAddType,
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
      className="min-w-[260px] flex-1 rounded-md border border-slate-200 bg-white p-3"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="min-w-0 break-words text-sm font-semibold uppercase tracking-wide text-slate-700">
          {column.name}
        </h2>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-slate-600">
            {column.tasks.length}
          </span>
          <button
            className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            type="button"
            onClick={() => onDeleteColumn(column.id)}
            aria-label={`Delete ${column.name} column`}
          >
            Delete column
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columnId={column.id}
            columns={columns}
            taskTypes={taskTypes}
            onAddType={onAddType}
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
        taskTypes={taskTypes}
        onAddType={onAddType}
        onAddTask={onAddTask}
        onUpdateDraft={onUpdateDraft}
      />
    </section>
  )
}

export default Column
