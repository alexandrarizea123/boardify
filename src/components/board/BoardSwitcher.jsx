function BoardSwitcher({ boards, activeBoardId, onSelect, onAdd, canAdd }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white p-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        Boards
      </span>
      <div className="flex flex-wrap gap-2">
        {boards.map((board) => (
          <button
            key={board.id}
            className={`rounded-md border px-3 py-1 text-xs font-semibold ${
              board.id === activeBoardId
                ? 'border-slate-300 bg-slate-100 text-slate-900'
                : 'border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
            type="button"
            onClick={() => onSelect(board.id)}
          >
            {board.name}
          </button>
        ))}
      </div>
      <button
        className="ml-auto inline-flex items-center gap-2 rounded-md border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-900 hover:border-slate-400 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
        type="button"
        onClick={onAdd}
        disabled={!canAdd}
        aria-label="Add board"
        title={canAdd ? 'Add board' : 'Board limit reached'}
      >
        <span className="text-base leading-none">+</span>
        New board
      </button>
    </div>
  )
}

export default BoardSwitcher
