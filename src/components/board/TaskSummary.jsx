
const typeColors = {
  Feature: 'bg-green-500',
  Bug: 'bg-red-500',
  Chore: 'bg-slate-500',
  Research: 'bg-purple-500',
}

const defaultTypeColors = [
  'bg-blue-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-cyan-500',
]

const getTypeColor = (type) => {
  if (typeColors[type]) return typeColors[type]
  
  // Simple hash to pick a stable color for custom types
  let hash = 0
  for (let i = 0; i < type.length; i++) {
    hash = type.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const index = Math.abs(hash) % defaultTypeColors.length
  return defaultTypeColors[index]
}

function TaskSummary({ typeStats }) {
  const totalTasks = Object.values(typeStats).reduce((acc, count) => acc + count, 0)

  return (
    <aside className="w-full shrink-0 space-y-4 rounded-md border border-slate-200 bg-white p-4 xl:w-64">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
        Task Summary
      </h3>
      <div className="space-y-3">
        {Object.entries(typeStats).map(([type, count]) => (
          <div key={type} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${getTypeColor(type)}`}
              />
              <span className="font-medium text-slate-700">{type}</span>
            </div>
            <span className="font-semibold text-slate-900">{count}</span>
          </div>
        ))}
        {totalTasks === 0 && (
          <p className="text-xs text-slate-500">No tasks yet.</p>
        )}
      </div>
      {totalTasks > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-600">Total</span>
            <span className="font-bold text-slate-900">{totalTasks}</span>
          </div>
        </div>
      )}
    </aside>
  )
}

export default TaskSummary
