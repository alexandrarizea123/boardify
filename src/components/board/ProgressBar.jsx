function ProgressBar({ doneCount, todoCount, percent }) {
  return (
    <footer className="border border-slate-200 p-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Done {doneCount} of {todoCount} tasks from To Do
        </span>
        <span>{percent}%</span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-slate-900 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </footer>
  )
}

export default ProgressBar
