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
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Create a board</h1>
          <p className="text-sm text-slate-600">
            Start with a board name and a short description.
          </p>
        </div>
        <form className="space-y-4" onSubmit={onCreateBoard}>
          <label className="block text-sm font-medium text-slate-700">
            Board name
            <input
              className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
              value={boardName}
              onChange={(event) => onBoardNameChange(event.target.value)}
              placeholder="Product Launch"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              className="mt-2 min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
              value={boardDescription}
              onChange={(event) => onBoardDescriptionChange(event.target.value)}
              placeholder="What does this board track?"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900"
              type="submit"
            >
              Create board
            </button>
            {onCancel && (
              <button
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
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
