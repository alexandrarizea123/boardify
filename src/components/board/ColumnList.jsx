import { emptyTaskDraft } from '../../data/boardData'
import Column from './Column'

function ColumnList({
  columns,
  taskDrafts,
  taskTypes,
  onAddType,
  onAddTask,
  onUpdateDraft,
  onDeleteColumn,
  onDeleteTask,
  onMoveTask,
  onUpdateTask,
}) {
  return (
    <main className="flex gap-3 overflow-x-auto pb-3">
      {columns.map((column) => (
        <Column
          key={column.id}
          column={column}
          draft={taskDrafts[column.id] || emptyTaskDraft()}
          columns={columns}
          taskTypes={taskTypes}
          onAddType={onAddType}
          onAddTask={onAddTask}
          onUpdateDraft={onUpdateDraft}
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
