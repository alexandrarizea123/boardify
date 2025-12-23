export const taskTypes = ['Feature', 'Bug', 'Chore', 'Research']
export const priorities = ['Highest', 'High', 'Medium', 'Low']
export const difficulties = ['Easy', 'Medium', 'Hard']
export const boardUsers = ['Me', 'Alex']

export const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 10)

export const emptyTaskDraft = () => ({
  name: '',
  description: '',
  assignee: boardUsers[0],
  type: taskTypes[0],
  priority: priorities[2],
  difficulty: difficulties[1],
  estimatedTime: '1h',
})

export const buildDefaultColumns = () => [
  { id: createId(), name: 'To Do', tasks: [] },
  { id: createId(), name: 'In Progress', tasks: [] },
  { id: createId(), name: 'Done', tasks: [] },
]

export const buildDrafts = (columns) =>
  Object.fromEntries(columns.map((column) => [column.id, emptyTaskDraft()]))
