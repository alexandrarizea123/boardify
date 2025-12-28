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
  const showTaskCta = typeof onOpenTaskForm === 'function'
  const canQuickAdd = columnKey === 'to do' && showTaskCta

  return (
    <section
      className="flex flex-col gap-3 min-w-0"
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
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            {column.name}
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {column.tasks.length}
          </span>
        </div>
        {canQuickAdd ? (
          <button
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            type="button"
            onClick={onOpenTaskForm}
            aria-label={`Add task to ${column.name}`}
          >
            +
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {column.tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-xs text-slate-400">
            {columnStyle.empty.title}
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
