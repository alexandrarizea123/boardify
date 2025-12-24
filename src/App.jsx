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
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <button
                  className={`flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-semibold shadow-sm transition-all ${
                    isTaskFormOpen
                      ? 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                  }`}
                  type="button"
                  onClick={() => setIsTaskFormOpen(!isTaskFormOpen)}
                >
                  {isTaskFormOpen ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Cancel
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      New task
                    </>
                  )}
                </button>
                <div className="w-full max-w-xs">
                  <ColumnForm
                    value={newColumnName}
                    onChange={setNewColumnName}
                    onSubmit={handleAddColumn}
                  />
                </div>
              </div>
              
              {isTaskFormOpen && todoColumn?.id && (
                <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
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
