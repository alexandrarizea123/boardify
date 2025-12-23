import { useBoardState } from './hooks/useBoardState'
import {
  BoardCreateForm,
  BoardHeader,
  BoardSwitcher,
  ColumnForm,
  ColumnList,
  ProgressBar,
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
    canAddBoard,
    isCreatingBoard,
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
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
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
          onUpdate={handleUpdateBoardDetails}
          onDelete={() => handleDeleteBoard(activeBoard.id)}
        />
        <ColumnForm
          value={newColumnName}
          onChange={setNewColumnName}
          onSubmit={handleAddColumn}
        />
        <ColumnList
          columns={activeBoard.columns}
          taskDrafts={taskDrafts}
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
    </div>
  )
}

export default App
