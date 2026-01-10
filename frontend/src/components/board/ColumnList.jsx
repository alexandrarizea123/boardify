import Column from './Column'

function ColumnList({
  columns,
  taskTypes,
  sprints,
  projectTagOptions,
  dependencyOptions,
  onAddType,
  onAddSprint,
  onDeleteColumn,
  onDeleteTask,
  onMoveTask,
  onOpenTaskForm,
  onUpdateTask,
}) {
  const minColumnWidth = 340 // Increased for wider, more premium columns

  return (
    <div className="w-full overflow-x-auto pb-6 scrollbar-thin">
      <main
        className="grid gap-6 px-1"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          minWidth: `${columns.length * minColumnWidth}px`,
        }}
      >
        {columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            columns={columns}
            taskTypes={taskTypes}
            sprints={sprints}
            projectTagOptions={projectTagOptions}
            dependencyOptions={dependencyOptions}
            onAddType={onAddType}
            onAddSprint={onAddSprint}
            onDeleteColumn={onDeleteColumn}
            onDeleteTask={onDeleteTask}
            onMoveTask={onMoveTask}
            onOpenTaskForm={onOpenTaskForm}
            onUpdateTask={onUpdateTask}
          />
        ))}
      </main>
    </div>
  )
}

export default ColumnList
