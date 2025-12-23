function BoardCreateForm({
  boardName,
  boardDescription,
  onBoardNameChange,
  onBoardDescriptionChange,
  onCreateBoard,
}) {
  return (
    <div className="min-h-screen bg-white px-6 py-16 text-slate-900">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Create a board</h1>
          <p className="text-sm text-slate-500">
            Start with a board name and a short description.
          </p>
        </div>
        <form className="space-y-4" onSubmit={onCreateBoard}>
          <label className="block text-sm font-medium text-slate-700">
            Board name
            <input
              className="mt-2 w-full border border-slate-200 px-3 py-2 text-sm outline-none"
              value={boardName}
              onChange={(event) => onBoardNameChange(event.target.value)}
              placeholder="Product Launch"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              className="mt-2 min-h-[120px] w-full border border-slate-200 px-3 py-2 text-sm outline-none"
              value={boardDescription}
              onChange={(event) => onBoardDescriptionChange(event.target.value)}
              placeholder="What does this board track?"
            />
          </label>
          <button
            className="border border-slate-900 px-4 py-2 text-sm font-semibold"
            type="submit"
          >
            Create board
          </button>
        </form>
      </div>
    </div>
  )
}

export default BoardCreateForm
