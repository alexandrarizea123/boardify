
import { boardUsers } from '../../data/boardData'

function DeveloperHoursChart({ developerStats }) {
  const maxHours = Math.max(...Object.values(developerStats), 0)
  const users = Object.keys(developerStats).sort()

  return (
    <div className="w-full shrink-0 space-y-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Workload
      </h3>
      <div className="space-y-4">
        {users.length > 0 ? (
          users.map((user) => {
            const hours = developerStats[user] || 0
            const percent = maxHours > 0 ? (hours / maxHours) * 100 : 0
            
            return (
              <div key={user} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{user}</span>
                  <span className="font-semibold text-slate-900">
                    {Number(hours).toFixed(1)}h
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/70">
                  <div
                    className="h-full rounded-full bg-slate-900 shadow-sm transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )
          })
        ) : (
          <p className="text-xs text-slate-400 italic">No data available.</p>
        )}
      </div>
    </div>
  )
}

export default DeveloperHoursChart
