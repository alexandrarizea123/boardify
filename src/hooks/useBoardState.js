import { useEffect, useMemo, useRef, useState } from 'react'
import { parseEstimatedTime } from '../utils/date'
import {
  boardUsers,
  buildDefaultColumns,
  buildDrafts,
  createId,
  difficulties,
  emptyTaskDraft,
  priorities,
  taskTypes as defaultTaskTypes,
} from '../data/boardData'

const MAX_BOARDS = 3
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const requestJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    const error = new Error(message || 'Request failed')
    error.status = response.status
    throw error
  }

  if (response.status === 204) return null
  return response.json()
}

const buildDraftsForBoards = (boards) =>
  Object.fromEntries(
    boards.map((board) => [board.id, buildDrafts(board.columns)]),
  )

export const useBoardState = () => {
  const initialBoardRef = useRef(null)
  if (!initialBoardRef.current) {
    const columns = buildDefaultColumns()
    initialBoardRef.current = {
      id: createId(),
      name: 'Default Board',
      description: '',
      columns,
    }
  }

  const initialBoard = initialBoardRef.current

  const [boards, setBoards] = useState(() => [initialBoard])
  const boardsRef = useRef([initialBoard])
  const [activeBoardId, setActiveBoardId] = useState(() => initialBoard.id)
  const [isCreatingBoard, setIsCreatingBoard] = useState(false)
  const [boardName, setBoardName] = useState('')
  const [boardDescription, setBoardDescription] = useState('')
  const [taskDraftsByBoard, setTaskDraftsByBoard] = useState(() => ({
    [initialBoard.id]: buildDrafts(initialBoard.columns),
  }))
  const [taskTypes, setTaskTypes] = useState(defaultTaskTypes)
  const [filterType, setFilterType] = useState('All')
  const [filterAssignee, setFilterAssignee] = useState('All')
  const [filterPriority, setFilterPriority] = useState('All')
  const [filterDifficulty, setFilterDifficulty] = useState('All')
  const [filterHasSubtasks, setFilterHasSubtasks] = useState('All')
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const [boardsData, taskTypesData] = await Promise.all([
          requestJson('/api/boards'),
          requestJson('/api/task-types'),
        ])

        if (!isMounted) return

        const nextBoards =
          Array.isArray(boardsData) && boardsData.length > 0
            ? boardsData
            : [initialBoardRef.current]
        setBoards(nextBoards)
        setActiveBoardId(nextBoards[0]?.id ?? null)
        setTaskDraftsByBoard(buildDraftsForBoards(nextBoards))

        const nextTypes =
          Array.isArray(taskTypesData) && taskTypesData.length > 0
            ? taskTypesData
            : defaultTaskTypes
        setTaskTypes(nextTypes)

        if (!boardsData || boardsData.length === 0) {
          await requestJson('/api/boards', {
            method: 'POST',
            body: JSON.stringify(initialBoardRef.current),
          })
        }

        if (!taskTypesData || taskTypesData.length === 0) {
          await Promise.all(
            defaultTaskTypes.map((type) =>
              requestJson('/api/task-types', {
                method: 'POST',
                body: JSON.stringify({ name: type }),
              }),
            ),
          )
        }
      } catch (err) {
        console.error('Failed to load data from API:', err)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    boardsRef.current = boards
  }, [boards])

  const activeBoard = useMemo(
    () => boards.find((board) => board.id === activeBoardId) ?? null,
    [boards, activeBoardId],
  )

  const filteredColumns = useMemo(() => {
    if (!activeBoard) return []
    const hasTypeFilter = filterType !== 'All'
    const hasAssigneeFilter = filterAssignee !== 'All'
    const hasPriorityFilter = filterPriority !== 'All'
    const hasDifficultyFilter = filterDifficulty !== 'All'
    const hasSubtaskFilter = filterHasSubtasks !== 'All'

    if (
      !hasTypeFilter &&
      !hasAssigneeFilter &&
      !hasPriorityFilter &&
      !hasDifficultyFilter &&
      !hasSubtaskFilter
    ) {
      return activeBoard.columns
    }

    return activeBoard.columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => {
        if (hasTypeFilter && task.type !== filterType) return false
        if (hasAssigneeFilter) {
          if (filterAssignee === 'Unassigned') {
            if (task.assignee) return false
          } else if (task.assignee !== filterAssignee) {
            return false
          }
        }
        if (hasPriorityFilter && task.priority !== filterPriority) return false
        if (hasDifficultyFilter && task.difficulty !== filterDifficulty) return false
        if (hasSubtaskFilter) {
          const hasSubtasks = (task.subtasks || []).length > 0
          if (filterHasSubtasks === 'Has Subtasks' && !hasSubtasks) return false
          if (filterHasSubtasks === 'No Subtasks' && hasSubtasks) return false
        }
        return true
      }),
    }))
  }, [
    activeBoard,
    filterAssignee,
    filterDifficulty,
    filterHasSubtasks,
    filterPriority,
    filterType,
  ])

  const activeTaskDrafts = taskDraftsByBoard[activeBoardId] || {}

  const typeStats = useMemo(() => {
    if (!activeBoard) return {}
    const stats = {}
    for (const column of activeBoard.columns) {
      for (const task of column.tasks) {
        stats[task.type] = (stats[task.type] || 0) + 1
      }
    }
    return stats
  }, [activeBoard])

  const assigneeOptions = useMemo(() => {
    if (!activeBoard) return ['All', ...boardUsers]
    const assignees = new Set(boardUsers)
    for (const column of activeBoard.columns) {
      for (const task of column.tasks) {
        if (task.assignee) {
          assignees.add(task.assignee)
        }
      }
    }
    return ['All', ...Array.from(assignees), 'Unassigned']
  }, [activeBoard])

  const priorityOptions = useMemo(() => ['All', ...priorities], [])
  const difficultyOptions = useMemo(() => ['All', ...difficulties], [])

  const progress = useMemo(() => {
    if (!activeBoard) return { todoCount: 0, doneCount: 0, percent: 0 }

    const todoColumn = activeBoard.columns.find(
      (column) => column.name.toLowerCase() === 'to do',
    )
    const doneColumn = activeBoard.columns.find(
      (column) => column.name.toLowerCase() === 'done',
    )
    const todoCount = todoColumn?.tasks.length ?? 0
    const doneCount = doneColumn?.tasks.length ?? 0
    const total = todoCount + doneCount
    const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100)

    return { todoCount, doneCount, percent }
  }, [activeBoard])

  const developerStats = useMemo(() => {
    if (!activeBoard) return {}
    const stats = {}
    for (const column of activeBoard.columns) {
      for (const task of column.tasks) {
        if (!task.assignee) continue
        const hours = parseEstimatedTime(task.estimatedTime)
        stats[task.assignee] = (stats[task.assignee] || 0) + hours
      }
    }
    return stats
  }, [activeBoard])

  const canAddBoard = boards.length < MAX_BOARDS

  const saveBoard = async (board) => {
    try {
      await requestJson(`/api/boards/${board.id}`, {
        method: 'PUT',
        body: JSON.stringify(board),
      })
    } catch (err) {
      if (err.status === 404) {
        await requestJson('/api/boards', {
          method: 'POST',
          body: JSON.stringify(board),
        })
      } else {
        console.error('Failed to save board:', err)
      }
    }
  }

  const deleteBoardFromApi = async (boardId) => {
    try {
      await requestJson(`/api/boards/${boardId}`, { method: 'DELETE' })
    } catch (err) {
      console.error('Failed to delete board:', err)
    }
  }

  const persistTaskType = async (type) => {
    try {
      await requestJson('/api/task-types', {
        method: 'POST',
        body: JSON.stringify({ name: type }),
      })
    } catch (err) {
      console.error('Failed to save task type:', err)
    }
  }

  const startCreateBoard = () => {
    if (!canAddBoard) return
    setIsCreatingBoard(true)
    setBoardName('')
    setBoardDescription('')
  }

  const cancelCreateBoard = () => {
    setIsCreatingBoard(false)
    setBoardName('')
    setBoardDescription('')
  }

  const handleCreateBoard = (event) => {
    event.preventDefault()
    if (!canAddBoard) return

    const trimmedName = boardName.trim()
    if (!trimmedName) return

    const columns = buildDefaultColumns()
    const newBoard = {
      id: createId(),
      name: trimmedName,
      description: boardDescription.trim(),
      columns,
    }

    setBoards((current) => [...current, newBoard])
    setActiveBoardId(newBoard.id)
    setTaskDraftsByBoard((current) => ({
      ...current,
      [newBoard.id]: buildDrafts(columns),
    }))
    setBoardName('')
    setBoardDescription('')
    setIsCreatingBoard(false)
    void saveBoard(newBoard)
  }

  const handleSelectBoard = (boardId) => {
    setActiveBoardId(boardId)
  }

  const handleUpdateBoardDetails = (updates) => {
    if (!activeBoardId) return
    updateActiveBoard((board) => ({
      ...board,
      ...updates,
    }))
  }

  const handleDeleteBoard = (boardId) => {
    const remaining = boards.filter((board) => board.id !== boardId)
    if (remaining.length === 0) {
      const columns = buildDefaultColumns()
      const fallbackBoard = {
        id: createId(),
        name: 'Default Board',
        description: '',
        columns,
      }
      setBoards([fallbackBoard])
      setActiveBoardId(fallbackBoard.id)
      setTaskDraftsByBoard({
        [fallbackBoard.id]: buildDrafts(columns),
      })
      setIsCreatingBoard(false)
      void deleteBoardFromApi(boardId)
      void saveBoard(fallbackBoard)
      return
    }

    setBoards(remaining)
    setActiveBoardId((currentId) =>
      currentId === boardId ? remaining[0]?.id ?? null : currentId,
    )
    setTaskDraftsByBoard((current) => {
      const { [boardId]: _, ...rest } = current
      return rest
    })
    setIsCreatingBoard(false)
    void deleteBoardFromApi(boardId)
  }

  const updateActiveBoard = (updater) => {
    if (!activeBoardId) return
    const currentBoards = boardsRef.current
    const updatedBoards = currentBoards.map((board) =>
      board.id === activeBoardId ? updater(board) : board,
    )
    const updatedBoard = updatedBoards.find(
      (board) => board.id === activeBoardId,
    )
    setBoards(updatedBoards)
    if (updatedBoard) {
      void saveBoard(updatedBoard)
    }
  }

  const handleAddTaskType = (newType) => {
    const trimmed = newType.trim()
    if (!trimmed) return
    setTaskTypes((current) => {
      if (current.includes(trimmed)) return current
      return [...current, trimmed]
    })
    void persistTaskType(trimmed)
  }

  const updateTaskDraft = (columnId, field, value) => {
    if (!activeBoardId) return
    setTaskDraftsByBoard((current) => ({
      ...current,
      [activeBoardId]: {
        ...(current[activeBoardId] || {}),
        [columnId]: {
          ...(current[activeBoardId]?.[columnId] || emptyTaskDraft()),
          [field]: value,
        },
      },
    }))
  }

  const handleAddTask = (event, columnId) => {
    event.preventDefault()
    if (!activeBoard) return

    const draft = activeTaskDrafts[columnId] || emptyTaskDraft()
    if (!draft.name.trim()) return

    const now = new Date().toISOString()
    const typeValue = draft.type?.trim()
    const priorityValue = draft.priority?.trim()
    const difficultyValue = draft.difficulty?.trim()
    const task = {
      id: createId(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      assignee: draft.assignee || '',
      type: typeValue || 'task',
      ...(priorityValue ? { priority: priorityValue } : {}),
      ...(difficultyValue ? { difficulty: difficultyValue } : {}),
      estimatedTime: draft.estimatedTime,
      dueDate: draft.dueDate,
      subtasks: draft.subtasks || [],
      createdAt: now,
      updatedAt: now,
    }

    updateActiveBoard((board) => ({
      ...board,
      columns: board.columns.map((column) =>
        column.id === columnId
          ? { ...column, tasks: [...column.tasks, task] }
          : column,
      ),
    }))

    setTaskDraftsByBoard((current) => ({
      ...current,
      [activeBoardId]: {
        ...(current[activeBoardId] || {}),
        [columnId]: emptyTaskDraft(),
      },
    }))
    setIsTaskFormOpen(false)
  }

  const handleMoveTask = (taskId, fromColumnId, toColumnId) => {
    if (!activeBoard || fromColumnId === toColumnId) return

    updateActiveBoard((board) => {
      let movingTask = null
      const updatedColumns = board.columns.map((column) => {
        if (column.id !== fromColumnId) return column
        const remaining = column.tasks.filter((task) => {
          if (task.id !== taskId) return true
          movingTask = { ...task, updatedAt: new Date().toISOString() }
          return false
        })
        return { ...column, tasks: remaining }
      })

      if (!movingTask) return board

      return {
        ...board,
        columns: updatedColumns.map((column) =>
          column.id === toColumnId
            ? { ...column, tasks: [...column.tasks, movingTask] }
            : column,
        ),
      }
    })
  }

  const handleDeleteTask = (taskId, columnId) => {
    if (!activeBoard) return

    updateActiveBoard((board) => ({
      ...board,
      columns: board.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== taskId),
            }
          : column,
      ),
    }))
  }

  const handleUpdateTask = (taskId, columnId, updates) => {
    if (!activeBoard) return

    updateActiveBoard((board) => {
      // Find Done column
      const doneColumn = board.columns.find((c) => c.name.toLowerCase() === 'done')
      const doneColumnId = doneColumn?.id

      let shouldMoveToDone = false
      
      // Calculate if we should move based on updates
      if (updates.subtasks && doneColumnId && columnId !== doneColumnId) {
        // If we are updating subtasks, check if ALL are now completed
        const allCompleted = updates.subtasks.length > 0 && updates.subtasks.every((st) => st.isCompleted)
        if (allCompleted) {
          shouldMoveToDone = true
        }
      }

      // First apply updates
      const updatedColumns = board.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              tasks: column.tasks.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      ...updates,
                      updatedAt: new Date().toISOString(),
                    }
                  : task,
              ),
            }
          : column,
      )

      if (!shouldMoveToDone) {
        return { ...board, columns: updatedColumns }
      }

      // If we need to move to Done, do it now
      // Remove from original column
      let movingTask = null
      const columnsAfterRemove = updatedColumns.map((column) => {
        if (column.id !== columnId) return column
        const tasks = column.tasks.filter((task) => {
          if (task.id === taskId) {
            movingTask = task
            return false
          }
          return true
        })
        return { ...column, tasks }
      })

      if (!movingTask) {
        return { ...board, columns: updatedColumns }
      }

      // Add to Done column
      const finalColumns = columnsAfterRemove.map((column) => {
        if (column.id === doneColumnId) {
          return { ...column, tasks: [...column.tasks, movingTask] }
        }
        return column
      })

      return { ...board, columns: finalColumns }
    })
  }

  return {
    boards,
    activeBoard,
    boardName,
    boardDescription,
    taskDrafts: activeTaskDrafts,
    progress,
    typeStats,
    developerStats,
    canAddBoard,
    isCreatingBoard,
    taskTypes,
    filterType,
    filterAssignee,
    filterPriority,
    filterDifficulty,
    filterHasSubtasks,
    filteredColumns,
    assigneeOptions,
    priorityOptions,
    difficultyOptions,
    isTaskFormOpen,
    setFilterType,
    setFilterAssignee,
    setFilterPriority,
    setFilterDifficulty,
    setFilterHasSubtasks,
    setIsTaskFormOpen,
    setBoardName,
    setBoardDescription,
    startCreateBoard,
    cancelCreateBoard,
    handleCreateBoard,
    handleSelectBoard,
    handleUpdateBoardDetails,
    handleDeleteBoard,
    handleAddTaskType,
    updateTaskDraft,
    handleAddTask,
    handleMoveTask,
    handleDeleteTask,
    handleUpdateTask,
  }
}
