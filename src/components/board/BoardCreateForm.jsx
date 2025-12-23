function BoardCreateForm({
  boardName,
  boardDescription,
  onBoardNameChange,
  onBoardDescriptionChange,
  onCreateBoard,
  onCancel,
}) {
  return (
    <div className="min-h-screen bg-[var(--color-tea-green-50)] px-5 py-12 text-[var(--color-tea-green-900)]">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-[var(--color-tea-green-200)] bg-[var(--color-papaya-whip-50)] p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Create a board</h1>
          <p className="text-sm text-[var(--color-tea-green-700)]">
            Start with a board name and a short description.
          </p>
        </div>
        <form className="space-y-4" onSubmit={onCreateBoard}>
          <label className="block text-sm font-medium text-[var(--color-tea-green-800)]">
            Board name
            <input
              className="mt-2 w-full rounded-xl border border-[var(--color-tea-green-200)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-tea-green-400)]"
              value={boardName}
              onChange={(event) => onBoardNameChange(event.target.value)}
              placeholder="Product Launch"
            />
          </label>
          <label className="block text-sm font-medium text-[var(--color-tea-green-800)]">
            Description
            <textarea
              className="mt-2 min-h-[120px] w-full rounded-xl border border-[var(--color-tea-green-200)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-tea-green-400)]"
              value={boardDescription}
              onChange={(event) => onBoardDescriptionChange(event.target.value)}
              placeholder="What does this board track?"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full border border-[var(--color-tea-green-700)] bg-[var(--color-tea-green-600)] px-4 py-2 text-sm font-semibold text-[var(--color-tea-green-50)]"
              type="submit"
            >
              Create board
            </button>
            {onCancel && (
              <button
                className="rounded-full border border-[var(--color-tea-green-200)] px-4 py-2 text-sm font-semibold text-[var(--color-tea-green-700)]"
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
