import { useMemo, useState } from 'react'
import { parseEstimatedTime } from '../utils/date'
import {
  buildDefaultColumns,
  buildDrafts,
  createId,
  emptyTaskDraft,
  taskTypes as defaultTaskTypes,
} from '../data/boardData'

const MAX_BOARDS = 3

export const useBoardState = () => {
  const [boards, setBoards] = useState([])
  const [activeBoardId, setActiveBoardId] = useState(null)
  const [isCreatingBoard, setIsCreatingBoard] = useState(false)
  const [boardName, setBoardName] = useState('')
  const [boardDescription, setBoardDescription] = useState('')
  const [newColumnName, setNewColumnName] = useState('')
  const [taskDraftsByBoard, setTaskDraftsByBoard] = useState({})
  const [taskTypes, setTaskTypes] = useState(defaultTaskTypes)
  const [filterType, setFilterType] = useState('All')

  const activeBoard = useMemo(
    () => boards.find((board) => board.id === activeBoardId) ?? null,
    [boards, activeBoardId],
  )

  const filteredColumns = useMemo(() => {
    if (!activeBoard) return []
    if (filterType === 'All') return activeBoard.columns

    return activeBoard.columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => task.type === filterType),
    }))
  }, [activeBoard, filterType])

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
  }

  const handleSelectBoard = (boardId) => {
    setActiveBoardId(boardId)
    setNewColumnName('')
  }

  const handleUpdateBoardDetails = (updates) => {
    if (!activeBoardId) return
    updateActiveBoard((board) => ({
      ...board,
      ...updates,
    }))
  }

  const handleDeleteBoard = (boardId) => {
    setBoards((current) => {
      const remaining = current.filter((board) => board.id !== boardId)
      setActiveBoardId((currentId) =>
        currentId === boardId ? remaining[0]?.id ?? null : currentId,
      )
      return remaining
    })
    setTaskDraftsByBoard((current) => {
      const { [boardId]: _, ...rest } = current
      return rest
    })
    setIsCreatingBoard(false)
  }

  const updateActiveBoard = (updater) => {
    setBoards((current) =>
      current.map((board) =>
        board.id === activeBoardId ? updater(board) : board,
      ),
    )
  }

  const handleAddColumn = (event) => {
    event.preventDefault()
    const trimmedName = newColumnName.trim()
    if (!trimmedName || !activeBoardId) return

    const column = { id: createId(), name: trimmedName, tasks: [] }
    updateActiveBoard((board) => ({
      ...board,
      columns: [...board.columns, column],
    }))
    setTaskDraftsByBoard((current) => ({
      ...current,
      [activeBoardId]: {
        ...(current[activeBoardId] || {}),
        [column.id]: emptyTaskDraft(),
      },
    }))
    setNewColumnName('')
  }

  const handleAddTaskType = (newType) => {
    const trimmed = newType.trim()
    if (!trimmed) return
    setTaskTypes((current) => {
      if (current.includes(trimmed)) return current
      return [...current, trimmed]
    })
  }

  const updateTaskDraft = (columnId, field, value) => {
    if (!activeBoardId) return
    setTaskDraftsByBoard((current) => ({
      ...current,
      [activeBoardId]: {
        ...(current[activeBoardId] || {}),
        [columnId]: {
          ...(current[activeBoardId]?.[columnId] || {}),
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
    const task = {
      id: createId(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      assignee: draft.assignee,
      type: draft.type,
      priority: draft.priority,
      difficulty: draft.difficulty,
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

  const handleDeleteColumn = (columnId) => {
    if (!activeBoardId) return

    updateActiveBoard((board) => ({
      ...board,
      columns: board.columns.filter((column) => column.id !== columnId),
    }))
    setTaskDraftsByBoard((current) => {
      const { [columnId]: _, ...rest } = current[activeBoardId] || {}
      return { ...current, [activeBoardId]: rest }
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
    newColumnName,
    taskDrafts: activeTaskDrafts,
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
  }
}
