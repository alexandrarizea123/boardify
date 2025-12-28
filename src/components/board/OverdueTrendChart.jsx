import { useMemo } from 'react'
import { parseDateInput } from '../../utils/date'

function OverdueTrendChart({ tasks = [] }) {
  const trendData = useMemo(() => {
    const days = 7
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today

    const data = []
    
    // Generate last 7 days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(23, 59, 59, 999) // End of that day
      
      const overdueCount = tasks.filter((task) => {
        if (!task.dueDate) return false
        
        const dueDate = parseDateInput(task.dueDate)
        if (!dueDate) return false
        dueDate.setHours(23, 59, 59, 999) // End of due day
        
        // Task must be created before or on this day
        const createdAt = parseDateInput(task.createdAt) || new Date(0)
        if (createdAt > date) return false

        // It is overdue if the date is past the due date
        const isPastDue = date > dueDate

        // And it was NOT completed before this day
        // We estimate completedAt using updatedAt if status is 'Done'
        // Ideally we'd have a specific completedAt, but this is a heuristic
        let isCompletedOnDate = false
        if (task.status === 'Done') {
          const completedAt = parseDateInput(task.updatedAt) || new Date(0)
          isCompletedOnDate = completedAt <= date
        }

        return isPastDue && !isCompletedOnDate
      }).length

      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: overdueCount,
      })
    }
    return data
  }, [tasks])

  const maxCount = Math.max(...trendData.map((d) => d.count), 5) // Minimum scale of 5

  // SVG dimensions
  const height = 100
  const width = 220
  const padding = 20

  const getX = (index) => padding + (index / (trendData.length - 1)) * (width - 2 * padding)
  const getY = (count) => height - padding - (count / maxCount) * (height - 2 * padding)

  const points = trendData
    .map((d, i) => `${getX(i)},${getY(d.count)}`)
    .join(' ')

  return (
    <div className="w-full shrink-0 space-y-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Overdue Trend
      </h3>
      
      <div className="relative h-[120px] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible text-slate-900"
        >
          {/* Grid lines */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#f1f5f9"
            strokeWidth="1.5"
          />
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="#f1f5f9"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Trend Line */}
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />

          {/* Data Points */}
          {trendData.map((d, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.count)}
              r="3.5"
              fill="white"
              stroke="currentColor"
              strokeWidth="2.5"
            />
          ))}

          {/* Labels */}
          {trendData.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height + 12}
              fontSize="9"
              textAnchor="middle"
              fill="#94a3b8"
              fontWeight="500"
            >
              {d.date}
            </text>
          ))}
        </svg>

        {/* Current Value Tooltip (Static for last point) */}
        <div className="absolute right-0 top-0 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
          {trendData[trendData.length - 1].count} overdue
        </div>
      </div>
    </div>
  )
}

export default OverdueTrendChart
