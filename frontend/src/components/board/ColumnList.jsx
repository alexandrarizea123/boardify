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
  const minColumnWidth = 280

  return (
    <div className="w-full overflow-x-auto pb-4">
      <main
        className="grid gap-4"
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
