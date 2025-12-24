import { useBoardState } from './hooks/useBoardState'
import {
  BoardCreateForm,
  BoardHeader,
  BoardSwitcher,
  ColumnForm,
  ColumnList,
  ProgressBar,
  TaskSummary,
  DeveloperHoursChart,
  TaskForm,
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
    developerStats,
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
    isTaskFormOpen,
    setIsTaskFormOpen,
  } = useBoardState()

  const todoColumn = activeBoard?.columns.find(
    (c) => c.name.toLowerCase() === 'to do',
  ) || activeBoard?.columns[0]

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
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <div className="flex flex-1 flex-col gap-5 min-w-0">
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
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex-1">
                  <ColumnForm
                    value={newColumnName}
                    onChange={setNewColumnName}
                    onSubmit={handleAddColumn}
                  />
                </div>
                <button
                  className={`h-[42px] rounded-md border px-4 text-sm font-semibold transition-colors ${
                    isTaskFormOpen
                      ? 'border-slate-200 bg-slate-100 text-slate-900 hover:bg-slate-200'
                      : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  type="button"
                  onClick={() => setIsTaskFormOpen(!isTaskFormOpen)}
                >
                  {isTaskFormOpen ? 'Cancel' : 'New task'}
                </button>
              </div>
              
              {isTaskFormOpen && todoColumn?.id && (
                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <TaskForm
                    columnId={todoColumn.id}
                    draft={taskDrafts?.[todoColumn.id]}
                    taskTypes={taskTypes}
                    onAddType={handleAddTaskType}
                    onAddTask={handleAddTask}
                    onUpdateDraft={updateTaskDraft}
                  />
                </div>
              )}
            </div>

            <ColumnList
              columns={filteredColumns}
              taskTypes={taskTypes}
              onAddType={handleAddTaskType}
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
          <div className="w-full space-y-6 lg:w-auto lg:pt-[52px]">
            <TaskSummary typeStats={typeStats} />
            <DeveloperHoursChart developerStats={developerStats} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
