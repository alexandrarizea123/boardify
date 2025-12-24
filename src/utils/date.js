export const parseDateInput = (value) => {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value === 'string') {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (match) {
      const year = Number(match[1])
      const month = Number(match[2]) - 1
      const day = Number(match[3])
      return new Date(year, month, day)
    }
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export const formatDate = (value) => {
  const date = parseDateInput(value)
  if (!date) return 'N/A'
  return date.toLocaleDateString()
}

export const parseEstimatedTime = (timeStr) => {
  if (!timeStr) return 0
  const normalized = timeStr.toString().toLowerCase().trim()
  const match = normalized.match(/^([\d.]+)([wdhm]?)$/)
  if (!match) return 0

  const value = parseFloat(match[1])
  const unit = match[2]

  switch (unit) {
    case 'd':
      return value * 8 // 1 day = 8 working hours
    case 'w':
      return value * 40 // 1 week = 40 working hours
    case 'm':
      return value / 60
    case 'h':
    default:
      return value
  }
}

export const getDueDateStatus = (dateStr) => {
  if (!dateStr) return null

  const due = parseDateInput(dateStr)
  if (!due) return null
  due.setHours(0, 0, 0, 0)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const diffTime = due - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, status: 'overdue' }
  if (diffDays === 0) return { text: 'Due today', status: 'due-soon' }
  if (diffDays <= 3) return { text: `${diffDays}d left`, status: 'due-soon' }
  
  return { text: formatDate(dateStr), status: 'normal' }
}
