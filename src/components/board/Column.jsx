import TaskCard from './TaskCard'

function Column({
  column,
  columns,
  taskTypes,
  onAddType,
  onDeleteTask,
  onMoveTask,
  onOpenTaskForm,
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

  const columnKey = column.name.toLowerCase()
  const columnStyles = {
    'to do': {
      dot: 'bg-slate-500',
      header: 'bg-slate-100/80 border-slate-200/70',
      title: 'text-slate-800',
      empty: {
        title: 'Create your first task',
        description: 'Add a task to start planning your work.',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-400',
        border: 'border-slate-200/70',
      },
    },
    'in progress': {
      dot: 'bg-blue-500',
      header: 'bg-blue-50/80 border-blue-200/70',
      title: 'text-blue-700',
      empty: {
        title: 'Drag a task here to start work',
        description: 'Move items from To Do when you begin.',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-400',
        border: 'border-blue-200/60',
      },
    },
    done: {
      dot: 'bg-emerald-500',
      header: 'bg-emerald-50/80 border-emerald-200/70',
      title: 'text-emerald-700',
      empty: {
        title: 'No completed tasks yet',
        description: 'Move finished items here to wrap them up.',
        iconBg: 'bg-emerald-50',
        iconColor: 'text-emerald-400',
        border: 'border-emerald-200/60',
      },
    },
  }

  const columnStyle = columnStyles[columnKey] || columnStyles['to do']
  const showTaskCta = columnKey === 'to do' && typeof onOpenTaskForm === 'function'

  return (
    <section
      className="flex min-w-[280px] flex-1 flex-col rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-200/60 transition-colors duration-200"
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
      <div
        className={`sticky top-0 z-10 mb-3 flex items-center justify-between rounded-xl border px-3 py-2 backdrop-blur ${columnStyle.header}`}
      >
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${columnStyle.dot}`} />
          <h2 className={`text-base font-semibold tracking-tight ${columnStyle.title}`}>
            {column.name}
          </h2>
          <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-semibold text-slate-500">
            {column.tasks.length}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {column.tasks.length === 0 ? (
          <div className={`flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed ${columnStyle.empty.border} bg-white/60 px-4 py-10 text-center`}>
            <div className={`mb-3 rounded-full p-3 ${columnStyle.empty.iconBg}`}>
              <svg
                className={`h-7 w-7 ${columnStyle.empty.iconColor}`}
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
            <p className="text-sm font-semibold text-slate-700">
              {columnStyle.empty.title}
            </p>
            <p className="mt-1 max-w-[180px] text-xs text-slate-500">
              {columnStyle.empty.description}
            </p>
            {showTaskCta ? (
              <button
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                type="button"
                onClick={onOpenTaskForm}
              >
                New task
              </button>
            ) : null}
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
              isDone={columnKey === 'done'}
            />
          ))
        )}
      </div>
    </section>
  )
}

export default Column
