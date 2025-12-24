import TaskCard from './TaskCard'

function Column({
  column,
  columns,
  taskTypes,
  onAddType,
  onDeleteTask,
  onMoveTask,
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

  const columnColors = {
    'to do': 'bg-slate-400',
    'in progress': 'bg-blue-500',
    'done': 'bg-green-500',
  }

  const dotColor = columnColors[column.name.toLowerCase()] || 'bg-slate-400'

  return (
    <section
      className="flex min-w-[280px] flex-1 flex-col rounded-xl bg-slate-50/50 p-3 transition-colors duration-200"
      onDragOver={(event) => {
        event.preventDefault()
        event.currentTarget.classList.add('bg-blue-50/80')
      }}
      onDragLeave={(event) => {
        event.currentTarget.classList.remove('bg-blue-50/80')
      }}
      onDrop={(event) => {
        event.currentTarget.classList.remove('bg-blue-50/80')
        handleDrop(event)
      }}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${dotColor}`} />
          <h2 className="text-sm font-semibold tracking-tight text-slate-800">
            {column.name}
          </h2>
          <span className="text-xs font-medium text-slate-400">
            {column.tasks.length}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {column.tasks.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-100 py-8 text-center">
            <div className="mb-2 rounded-full bg-slate-50 p-3">
              <svg
                className="h-6 w-6 text-slate-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-500">No tasks yet</p>
          </div>
        ) : (
          column.tasks.map((task) => (
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
          ))
        )}
      </div>
    </section>
  )
}

export default Column
