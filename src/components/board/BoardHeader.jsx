function BoardHeader({ name, description }) {
  return (
    <header className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Task Management Board
      </p>
      <h1 className="text-3xl font-semibold">{name}</h1>
      {description && (
        <p className="max-w-2xl text-sm text-slate-500">{description}</p>
      )}
    </header>
  )
}

export default BoardHeader
