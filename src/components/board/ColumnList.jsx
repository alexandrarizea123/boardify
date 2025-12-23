import { emptyTaskDraft } from '../../data/boardData'
import Column from './Column'

function ColumnList({
  columns,
  taskDrafts,
  onAddTask,
  onUpdateDraft,
  onDeleteColumn,
  onDeleteTask,
  onMoveTask,
}) {
  return (
    <main className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          draft={taskDrafts[column.id] || emptyTaskDraft()}
          columns={columns}
          onAddTask={onAddTask}
          onUpdateDraft={onUpdateDraft}
          onDeleteColumn={onDeleteColumn}
          onDeleteTask={onDeleteTask}
          onMoveTask={onMoveTask}
        />
      ))}
    </main>
  )
}

export default ColumnList
