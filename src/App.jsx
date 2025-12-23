import { useBoardState } from './hooks/useBoardState'
import {
  BoardCreateForm,
  BoardHeader,
  ColumnForm,
  ColumnList,
  ProgressBar,
} from './components/board'

function App() {
  const {
    board,
    boardName,
    boardDescription,
    newColumnName,
    taskDrafts,
    progress,
    setBoardName,
    setBoardDescription,
    setNewColumnName,
    handleCreateBoard,
    handleAddColumn,
    updateTaskDraft,
    handleAddTask,
    handleMoveTask,
    handleDeleteColumn,
    handleDeleteTask,
    handleUpdateTask,
  } = useBoardState()

  if (!board) {
    return (
      <BoardCreateForm
        boardName={boardName}
        boardDescription={boardDescription}
        onBoardNameChange={setBoardName}
        onBoardDescriptionChange={setBoardDescription}
        onCreateBoard={handleCreateBoard}
      />
    )
  }

  return (
    <div className="min-h-screen bg-white px-6 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <BoardHeader name={board.name} description={board.description} />
        <ColumnForm
          value={newColumnName}
          onChange={setNewColumnName}
          onSubmit={handleAddColumn}
        />
        <ColumnList
          columns={board.columns}
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
