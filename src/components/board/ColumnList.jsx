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
  return (
    <main className="grid w-full grid-flow-col auto-cols-[minmax(280px,1fr)] gap-4 overflow-x-auto pb-4">
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
  )
}

export default ColumnList
