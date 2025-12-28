function BoardSwitcher({ boards, activeBoardId, onSelect, onAdd, canAdd }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5">
        {boards.map((board) => (
          <button
            key={board.id}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              board.id === activeBoardId
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            type="button"
            onClick={() => onSelect(board.id)}
          >
            {board.name}
          </button>
        ))}
      </div>
      <button
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300"
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
