function ProgressBar({ doneCount, todoCount, percent }) {
  return (
    <footer className="rounded-2xl border border-[var(--color-tea-green-200)] bg-[var(--color-beige-50)] p-3">
      <div className="flex items-center justify-between text-sm text-[var(--color-tea-green-700)]">
        <span>
          Done {doneCount} of {todoCount} tasks from To Do
        </span>
        <span className="font-semibold text-[var(--color-tea-green-800)]">
          {percent}%
        </span>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--color-tea-green-100)]">
        <div
          className="h-full rounded-full bg-[var(--color-tea-green-600)] transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </footer>
  )
}

export default ProgressBar
