
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
  const total = Object.values(typeStats).reduce((a, b) => a + b, 0)
  
  return (
    <div className="w-full shrink-0 space-y-5">
      <div className="flex items-center justify-between">
         <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
           Task Distribution
         </h3>
         <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-sm">
            {total} Total
         </span>
      </div>
      
      <div className="space-y-3">
        {Object.entries(typeStats).length > 0 ? (
          Object.entries(typeStats).map(([type, count]) => (
            <div key={type} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${getTypeColor(type)}`}
                  aria-hidden
                />
                {type}
              </span>
              <div className="flex items-center gap-2">
                 <div className="h-1.5 w-24 rounded-full bg-slate-200/70 overflow-hidden">
                    <div 
                       className={`h-full rounded-full ${getTypeColor(type)}`}
                       style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                    />
                 </div>
                 <span className="w-4 text-right text-xs font-semibold text-slate-900">{count}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 italic">No tasks yet.</p>
        )}
      </div>
    </div>
  )
}

export default TaskSummary
