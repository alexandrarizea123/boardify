function BoardCreateForm({
  boardName,
  boardDescription,
  onBoardNameChange,
  onBoardDescriptionChange,
  onCreateBoard,
  onCancel,
}) {
  return (
    <div className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create a board</h1>
          <p className="text-sm text-slate-500">
            Start with a board name and a short description.
          </p>
        </div>
        <form className="space-y-4" onSubmit={onCreateBoard}>
          <label className="block text-sm font-medium text-slate-700">
            Board name
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
              value={boardName}
              onChange={(event) => onBoardNameChange(event.target.value)}
              placeholder="Product Launch"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              className="mt-2 min-h-[120px] w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
              value={boardDescription}
              onChange={(event) => onBoardDescriptionChange(event.target.value)}
              placeholder="What does this board track?"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-200"
              type="submit"
            >
              Create board
            </button>
            {onCancel && (
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                type="button"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default BoardCreateForm
