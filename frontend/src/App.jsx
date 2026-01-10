'use client'

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

function App({ mode, preferredBoardId } = {}) {
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
  } = useBoardState({ mode, preferredBoardId })

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
    <div className="min-h-screen text-slate-900 pb-20">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 border-b border-white/50 bg-white/70 px-6 py-3 backdrop-blur-xl transition-all duration-200">
        <div className="mx-auto flex w-full max-w-[1600px] items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 ring-1 ring-white/20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="h-6 w-6 text-white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display truncate text-lg font-bold tracking-tight text-slate-900">
                {activeBoard.name}
              </h1>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 md:block" />
              <p className="hidden truncate text-xs font-medium text-slate-500 md:block">
                {activeBoard.description || 'Task Management'}
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <BoardSwitcher
              boards={boards}
              activeBoardId={activeBoard.id}
              onSelect={handleSelectBoard}
              onAdd={mode === 'collab' ? null : startCreateBoard}
              canAdd={mode === 'collab' ? false : canAddBoard}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-[1600px] px-6">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
          <div className="flex flex-1 flex-col gap-6 min-w-0">
            {/* Headers & Actions */}
            <div className="rounded-2xl border border-white/60 bg-white/40 p-2 backdrop-blur-md">
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
            </div>

            {isTaskFormOpen && todoColumn?.id && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
                <div
                  className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                  onClick={() => setIsTaskFormOpen(false)}
                />
                <section
                  className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Create new task"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Create New Task
                      </h2>
                      <p className="text-xs font-medium text-slate-500">
                        Add details for your next item in <span className="text-indigo-600">{todoColumnLabel}</span>
                      </p>
                    </div>
                    <button
                      className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                      type="button"
                      onClick={() => setIsTaskFormOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
                    <TaskForm
                      columnId={todoColumn.id}
                      draft={taskDrafts?.[todoColumn.id] || emptyTaskDraft()}
                      taskTypes={taskTypes}
                      sprints={sprints}
                      assignees={assigneeOptions.filter(
                        (opt) => opt !== 'All' && opt !== 'Unassigned',
                      )}
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
              onDeleteColumn={() => { }} // No-op since columns are fixed
              onDeleteTask={handleDeleteTask}
              onMoveTask={handleMoveTask}
              onOpenTaskForm={() => setIsTaskFormOpen(true)}
              onUpdateTask={handleUpdateTask}
            />
            <ProgressBar
              doneCount={progress.doneCount}
              totalCount={progress.totalCount}
              percent={progress.percent}
            />
          </div>

          <div className="w-full shrink-0 space-y-6 xl:w-[360px]">
            <div className="sticky top-28 space-y-6">
              <div className="rounded-2xl border border-white/60 bg-white/40 p-6 shadow-glass backdrop-blur-md">
                <div className="mb-6 flex items-center gap-3 text-sm font-bold text-slate-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3v18h18" />
                      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                    </svg>
                  </div>
                  Project Analytics
                </div>
                <div className="space-y-6">
                  <div className="rounded-xl border border-white/50 bg-white/50 p-1 shadow-sm">
                    <TaskSummary typeStats={typeStats} />
                  </div>
                  <div className="rounded-xl border border-white/50 bg-white/50 p-4 shadow-sm">
                    <DeveloperHoursChart developerStats={developerStats} />
                  </div>
                  <div className="rounded-xl border border-white/50 bg-white/50 p-4 shadow-sm">
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
