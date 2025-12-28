function ProgressBar({ doneCount, todoCount, percent }) {
  return (
    <footer className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm font-medium text-slate-700">
        <span>
          Done {doneCount} of {todoCount} tasks from To Do
        </span>
        <span className="font-semibold text-slate-700">
          {percent}%
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
        <div
          className="h-full rounded-full bg-slate-900 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </footer>
  )
}

export default ProgressBar
