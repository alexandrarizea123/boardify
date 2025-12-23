export const formatDate = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
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

  const due = new Date(dateStr)
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
