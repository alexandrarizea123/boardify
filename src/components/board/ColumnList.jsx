import Column from './Column'

function ColumnList({
  columns,
  taskTypes,
  onAddType,
  onDeleteColumn,
  onDeleteTask,
  onMoveTask,
  onUpdateTask,
}) {
  return (
    <main className="flex w-full gap-3 overflow-x-auto pb-3">
      {columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          columns={columns}
          taskTypes={taskTypes}
          onAddType={onAddType}
          onDeleteColumn={onDeleteColumn}
          onDeleteTask={onDeleteTask}
          onMoveTask={onMoveTask}
          onUpdateTask={onUpdateTask}
        />
      ))}
    </main>
  )
}

export default ColumnList

