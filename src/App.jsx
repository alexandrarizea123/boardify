import { useBoardState } from './hooks/useBoardState'
import { emptyTaskDraft } from './data/boardData'
import {
  BoardCreateForm,
  BoardHeader,
  BoardSwitcher,
  ColumnList,
  ProgressBar,
  TaskSummary,
  DeveloperHoursChart,
  OverdueTrendChart,
  TaskForm,
} from './components/board'

function App() {
  const {
    boards,
    activeBoard,
    boardName,
    boardDescription,
    taskDrafts,
    progress,
    typeStats,
    developerStats,
    canAddBoard,
    isCreatingBoard,
    taskTypes,
    sprints,
    filterType,
    filterAssignee,
    filterPriority,
    filterDifficulty,
    filterHasSubtasks,
    filterSprint,
    filterProjectTag,
    filterQuery,
    filteredColumns,
    assigneeOptions,
    priorityOptions,
    difficultyOptions,
    sprintOptions,
    projectTagOptions,
    setFilterType,
    setFilterAssignee,
    setFilterPriority,
    setFilterDifficulty,
    setFilterHasSubtasks,
    setFilterSprint,
    setFilterProjectTag,
    setFilterQuery,
    setBoardName,
    setBoardDescription,
    startCreateBoard,
    cancelCreateBoard,
    handleCreateBoard,
    handleSelectBoard,
    handleUpdateBoardDetails,
    handleDeleteBoard,
    handleAddTaskType,
    handleAddSprint,
    updateTaskDraft,
    handleAddTask,
    handleMoveTask,
    handleDeleteTask,
    handleUpdateTask,
    isTaskFormOpen,
    setIsTaskFormOpen,
  } = useBoardState()

  const todoColumn = activeBoard?.columns.find(
    (c) => c.name.toLowerCase() === 'to do',
  ) || activeBoard?.columns[0]
  const todoColumnLabel = todoColumn?.name || 'To Do'

  const allTasks =
    activeBoard?.columns.flatMap((col) =>
      col.tasks.map((task) => ({ ...task, status: col.name })),
    ) || []
  const dependencyOptions =
    activeBoard?.columns.flatMap((col) =>
      col.tasks.map((task) => ({
        id: task.id,
        name: task.name,
        column: col.name,
      })),
    ) || []

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
    <div className="min-h-screen bg-white px-6 py-6 text-slate-900">
      <div className="mx-auto w-full max-w-[1480px]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <div className="flex flex-1 flex-col gap-5 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="2" />
                    <rect x="14" y="3" width="7" height="7" rx="2" />
                    <rect x="3" y="14" width="7" height="7" rx="2" />
                    <rect x="14" y="14" width="7" height="7" rx="2" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    {activeBoard.name}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {activeBoard.description || 'Task Management'}
                  </p>
                </div>
              </div>
            </div>

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
              searchQuery={filterQuery}
              onSearchChange={setFilterQuery}
              assigneeOptions={assigneeOptions}
              assigneeFilter={filterAssignee}
              onAssigneeFilterChange={setFilterAssignee}
              priorityOptions={priorityOptions}
              priorityFilter={filterPriority}
              onPriorityFilterChange={setFilterPriority}
              difficultyOptions={difficultyOptions}
              difficultyFilter={filterDifficulty}
              onDifficultyFilterChange={setFilterDifficulty}
              sprintOptions={sprintOptions}
              sprintFilter={filterSprint}
              onSprintFilterChange={setFilterSprint}
              projectTagOptions={projectTagOptions}
              projectTagFilter={filterProjectTag}
              onProjectTagFilterChange={setFilterProjectTag}
              subtaskFilter={filterHasSubtasks}
              onSubtaskFilterChange={setFilterHasSubtasks}
              onUpdate={handleUpdateBoardDetails}
              onDelete={() => handleDeleteBoard(activeBoard.id)}
            />

            {isTaskFormOpen && todoColumn?.id && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                <div
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                  onClick={() => setIsTaskFormOpen(false)}
                />
                <section
                  className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Create new task"
                >
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        New task
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        Add the details for your next item.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-600">
                        {todoColumnLabel}
                      </span>
                      <button
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                        type="button"
                        onClick={() => setIsTaskFormOpen(false)}
                      >
                        <span className="text-xs leading-none">×</span>
                        Cancel
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto px-5 py-3">
                    <TaskForm
                      columnId={todoColumn.id}
                      draft={taskDrafts?.[todoColumn.id] || emptyTaskDraft()}
                      taskTypes={taskTypes}
                      sprints={sprints}
                      onAddSprint={handleAddSprint}
                      projectTagOptions={projectTagOptions}
                      dependencyOptions={dependencyOptions}
                      onAddType={handleAddTaskType}
                      onAddTask={handleAddTask}
                      onUpdateDraft={updateTaskDraft}
                    />
                  </div>
                </section>
              </div>
            )}

            <ColumnList
              columns={filteredColumns}
              taskTypes={taskTypes}
              sprints={sprints}
              projectTagOptions={projectTagOptions}
              dependencyOptions={dependencyOptions}
              onAddType={handleAddTaskType}
              onAddSprint={handleAddSprint}
              onDeleteColumn={() => {}} // No-op since columns are fixed
              onDeleteTask={handleDeleteTask}
              onMoveTask={handleMoveTask}
              onOpenTaskForm={() => setIsTaskFormOpen(true)}
              onUpdateTask={handleUpdateTask}
            />
            <ProgressBar
              doneCount={progress.doneCount}
              todoCount={progress.todoCount}
              percent={progress.percent}
            />
          </div>
          
          <div className="w-full shrink-0 space-y-6 lg:w-80">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 19V5" />
                    <path d="M8 19V9" />
                    <path d="M12 19V12" />
                    <path d="M16 19V7" />
                    <path d="M20 19V11" />
                  </svg>
                  Analytics
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <TaskSummary typeStats={typeStats} />
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <DeveloperHoursChart developerStats={developerStats} />
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <OverdueTrendChart tasks={allTasks} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
