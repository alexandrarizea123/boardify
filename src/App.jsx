import { useBoardState } from './hooks/useBoardState'
import {
  BoardCreateForm,
  BoardHeader,
  BoardSwitcher,
  ColumnForm,
  ColumnList,
  ProgressBar,
  TaskSummary,
} from './components/board'

function App() {
  const {
    boards,
    activeBoard,
    boardName,
    boardDescription,
    newColumnName,
    taskDrafts,
    progress,
    typeStats,
    canAddBoard,
    isCreatingBoard,
    taskTypes,
    filterType,
    filteredColumns,
    setFilterType,
    setBoardName,
    setBoardDescription,
    setNewColumnName,
    startCreateBoard,
    cancelCreateBoard,
    handleCreateBoard,
    handleSelectBoard,
    handleUpdateBoardDetails,
    handleDeleteBoard,
    handleAddColumn,
    handleAddTaskType,
    updateTaskDraft,
    handleAddTask,
    handleMoveTask,
    handleDeleteColumn,
    handleDeleteTask,
    handleUpdateTask,
  } = useBoardState()

  if (!activeBoard || isCreatingBoard) {
    return (
      <BoardCreateForm
        boardName={boardName}
        boardDescription={boardDescription}
        onBoardNameChange={setBoardName}
        onBoardDescriptionChange={setBoardDescription}
        onCreateBoard={handleCreateBoard}
        onCancel={activeBoard ? cancelCreateBoard : null}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="flex items-start gap-6">
          <div className="flex flex-1 flex-col gap-5">
            <BoardSwitcher
              boards={boards}
              activeBoardId={activeBoard.id}
              onSelect={handleSelectBoard}
              onAdd={startCreateBoard}
              canAdd={canAddBoard}
            />
            <BoardHeader
              name={activeBoard.name}
              description={activeBoard.description}
              taskTypes={taskTypes}
              filterType={filterType}
              onFilterChange={setFilterType}
              onUpdate={handleUpdateBoardDetails}
              onDelete={() => handleDeleteBoard(activeBoard.id)}
            />
            <ColumnForm
              value={newColumnName}
              onChange={setNewColumnName}
              onSubmit={handleAddColumn}
            />
            <ColumnList
              columns={filteredColumns}
              taskDrafts={taskDrafts}
              taskTypes={taskTypes}
              onAddType={handleAddTaskType}
              onAddTask={handleAddTask}
              onUpdateDraft={updateTaskDraft}
              onDeleteColumn={handleDeleteColumn}
              onDeleteTask={handleDeleteTask}
              onMoveTask={handleMoveTask}
              onUpdateTask={handleUpdateTask}
            />
            <ProgressBar
              doneCount={progress.doneCount}
              todoCount={progress.todoCount}
              percent={progress.percent}
            />
          </div>
          <div className="sticky top-8 pt-[52px]">
            <TaskSummary typeStats={typeStats} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
