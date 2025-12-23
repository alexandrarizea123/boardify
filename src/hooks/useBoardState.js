import { useMemo, useState } from 'react'
import {
  buildDefaultColumns,
  buildDrafts,
  createId,
  emptyTaskDraft,
} from '../data/boardData'

export const useBoardState = () => {
  const [board, setBoard] = useState(null)
  const [boardName, setBoardName] = useState('')
  const [boardDescription, setBoardDescription] = useState('')
  const [newColumnName, setNewColumnName] = useState('')
  const [taskDrafts, setTaskDrafts] = useState({})

  const progress = useMemo(() => {
    if (!board) return { todoCount: 0, doneCount: 0, percent: 0 }

    const todoColumn = board.columns.find(
      (column) => column.name.toLowerCase() === 'to do',
    )
    const doneColumn = board.columns.find(
      (column) => column.name.toLowerCase() === 'done',
    )
    const todoCount = todoColumn?.tasks.length ?? 0
    const doneCount = doneColumn?.tasks.length ?? 0
    const total = todoCount + doneCount
    const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100)

    return { todoCount, doneCount, percent }
  }, [board])

  const handleCreateBoard = (event) => {
    event.preventDefault()
    const trimmedName = boardName.trim()
    if (!trimmedName) return

    const columns = buildDefaultColumns()
    setBoard({
      id: createId(),
      name: trimmedName,
      description: boardDescription.trim(),
      columns,
    })
    setTaskDrafts(buildDrafts(columns))
    setBoardName('')
    setBoardDescription('')
  }

  const handleAddColumn = (event) => {
    event.preventDefault()
    const trimmedName = newColumnName.trim()
    if (!trimmedName || !board) return

    const column = { id: createId(), name: trimmedName, tasks: [] }
    setBoard((current) => ({
      ...current,
      columns: [...current.columns, column],
    }))
    setTaskDrafts((current) => ({
      ...current,
      [column.id]: emptyTaskDraft(),
    }))
    setNewColumnName('')
  }

  const updateTaskDraft = (columnId, field, value) => {
    setTaskDrafts((current) => ({
      ...current,
      [columnId]: {
        ...current[columnId],
        [field]: value,
      },
    }))
  }

  const handleAddTask = (event, columnId) => {
    event.preventDefault()
    if (!board) return

    const draft = taskDrafts[columnId] || emptyTaskDraft()
    if (!draft.name.trim()) return

    const now = new Date().toISOString()
    const task = {
      id: createId(),
      name: draft.name.trim(),
      description: draft.description.trim(),
      assignee: draft.assignee,
      type: draft.type,
      priority: draft.priority,
      createdAt: now,
      updatedAt: now,
    }

    setBoard((current) => ({
      ...current,
      columns: current.columns.map((column) =>
        column.id === columnId
          ? { ...column, tasks: [...column.tasks, task] }
          : column,
      ),
    }))

    setTaskDrafts((current) => ({
      ...current,
      [columnId]: emptyTaskDraft(),
    }))
  }

  const handleMoveTask = (taskId, fromColumnId, toColumnId) => {
    if (!board || fromColumnId === toColumnId) return

    setBoard((current) => {
      let movingTask = null
      const updatedColumns = current.columns.map((column) => {
        if (column.id !== fromColumnId) return column
        const remaining = column.tasks.filter((task) => {
          if (task.id !== taskId) return true
          movingTask = { ...task, updatedAt: new Date().toISOString() }
          return false
        })
        return { ...column, tasks: remaining }
      })

      if (!movingTask) return current

      return {
        ...current,
        columns: updatedColumns.map((column) =>
          column.id === toColumnId
            ? { ...column, tasks: [...column.tasks, movingTask] }
            : column,
        ),
      }
    })
  }

  const handleDeleteColumn = (columnId) => {
    if (!board) return

    setBoard((current) => ({
      ...current,
      columns: current.columns.filter((column) => column.id !== columnId),
    }))
    setTaskDrafts((current) => {
      const { [columnId]: _, ...rest } = current
      return rest
    })
  }

  const handleDeleteTask = (taskId, columnId) => {
    if (!board) return

    setBoard((current) => ({
      ...current,
      columns: current.columns.map((column) =>
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
    if (!board) return

    setBoard((current) => ({
      ...current,
      columns: current.columns.map((column) =>
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
      ),
    }))
  }

  return {
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
  }
}
