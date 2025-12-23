function ProgressBar({ doneCount, todoCount, percent }) {
  return (
    <footer className="rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between text-sm text-slate-700">
        <span>
          Done {doneCount} of {todoCount} tasks from To Do
        </span>
        <span className="font-semibold text-slate-700">
          {percent}%
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-md bg-slate-100">
        <div
          className="h-full rounded-md bg-slate-400 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </footer>
  )
}

export default ProgressBar
