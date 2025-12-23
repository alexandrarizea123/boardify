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
