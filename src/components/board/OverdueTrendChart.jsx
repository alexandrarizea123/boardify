import { useMemo } from 'react'

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
        
        const dueDate = new Date(task.dueDate)
        dueDate.setHours(23, 59, 59, 999) // End of due day
        
        // Task must be created before or on this day
        const createdAt = new Date(task.createdAt || 0)
        if (createdAt > date) return false

        // It is overdue if the date is past the due date
        const isPastDue = date > dueDate

        // And it was NOT completed before this day
        // We estimate completedAt using updatedAt if status is 'Done'
        // Ideally we'd have a specific completedAt, but this is a heuristic
        let isCompletedOnDate = false
        if (task.status === 'Done') {
          const completedAt = new Date(task.updatedAt || 0)
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
    <div className="w-full shrink-0 space-y-4 rounded-md border border-slate-200 bg-white p-4 lg:w-64">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
        Overdue Trend (7 Days)
      </h3>
      
      <div className="relative h-[120px] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible text-blue-500"
        >
          {/* Grid lines */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Trend Line */}
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {trendData.map((d, i) => (
            <circle
              key={i}
              cx={getX(i)}
              cy={getY(d.count)}
              r="3"
              fill="white"
              stroke="currentColor"
              strokeWidth="2"
            />
          ))}

          {/* Labels */}
          {trendData.map((d, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height}
              fontSize="8"
              textAnchor="middle"
              fill="#64748b"
            >
              {d.date}
            </text>
          ))}
        </svg>

        {/* Current Value Tooltip (Static for last point) */}
        <div className="absolute right-0 top-0 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
          {trendData[trendData.length - 1].count} overdue
        </div>
      </div>
    </div>
  )
}

export default OverdueTrendChart
