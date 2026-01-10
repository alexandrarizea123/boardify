import TaskCard from './TaskCard'

function Column({
  column,
  columns,
  taskTypes,
  sprints,
  projectTagOptions,
  dependencyOptions,
  onAddType,
  onAddSprint,
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
      border: 'border-t-indigo-500',
      headerText: 'text-indigo-900',
      countBg: 'bg-indigo-100 text-indigo-700',
    },
    'in progress': {
      border: 'border-t-blue-500',
      headerText: 'text-blue-900',
      countBg: 'bg-blue-100 text-blue-700',
    },
    done: {
      border: 'border-t-emerald-500',
      headerText: 'text-emerald-900',
      countBg: 'bg-emerald-100 text-emerald-700',
    },
  }

  const style = columnStyles[columnKey] || columnStyles['to do']
  const showTaskCta = typeof onOpenTaskForm === 'function'
  const canQuickAdd = columnKey === 'to do' && showTaskCta

  return (
    <section
      className="flex flex-col gap-4 min-w-[320px] rounded-2xl bg-slate-50/50 p-2 ring-1 ring-slate-200/50"
      onDragOver={(event) => {
        event.preventDefault()
        event.currentTarget.classList.add('bg-indigo-50/50', 'ring-indigo-300')
      }}
      onDragLeave={(event) => {
        event.currentTarget.classList.remove('bg-indigo-50/50', 'ring-indigo-300')
      }}
      onDrop={(event) => {
        event.currentTarget.classList.remove('bg-indigo-50/50', 'ring-indigo-300')
        handleDrop(event)
      }}
    >
      <div className={`glass-card flex items-center justify-between rounded-xl px-4 py-3 border-t-4 ${style.border}`}>
        <div className="flex items-center gap-3">
          <h2 className={`text-sm font-bold tracking-tight ${style.headerText}`}>
            {column.name}
          </h2>
          <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold ${style.countBg}`}>
            {column.tasks.length}
          </span>
        </div>
        {canQuickAdd ? (
          <button
            className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
            type="button"
            onClick={onOpenTaskForm}
            aria-label={`Add task to ${column.name}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 min-h-[150px]">
        {column.tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/30 px-4 py-12 text-center transition-colors hover:bg-slate-50 hover:border-slate-300">
            <div className="mb-2 rounded-full bg-white p-3 shadow-sm ring-1 ring-slate-100">
              <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-slate-500">No tasks yet</p>
            {canQuickAdd && (
              <button
                onClick={onOpenTaskForm}
                className="mt-2 text-[11px] font-bold text-indigo-600 hover:underline"
              >
                Create one now
              </button>
            )}
          </div>
        ) : (
          column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnId={column.id}
              columns={columns}
              taskTypes={taskTypes}
              sprints={sprints}
              projectTagOptions={projectTagOptions}
              dependencyOptions={dependencyOptions}
              onAddType={onAddType}
              onAddSprint={onAddSprint}
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
