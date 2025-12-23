function BoardSwitcher({ boards, activeBoardId, onSelect, onAdd, canAdd }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--color-tea-green-200)] bg-[var(--color-papaya-whip-50)] p-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-tea-green-600)]">
        Boards
      </span>
      <div className="flex flex-wrap gap-2">
        {boards.map((board) => (
          <button
            key={board.id}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              board.id === activeBoardId
                ? 'border-[var(--color-tea-green-700)] bg-[var(--color-tea-green-100)] text-[var(--color-tea-green-900)]'
                : 'border-[var(--color-tea-green-200)] text-[var(--color-tea-green-700)] hover:border-[var(--color-tea-green-300)]'
            }`}
            type="button"
            onClick={() => onSelect(board.id)}
          >
            {board.name}
          </button>
        ))}
      </div>
      <button
        className="ml-auto inline-flex items-center gap-2 rounded-full border border-[var(--color-tea-green-300)] bg-[var(--color-cornsilk-100)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-tea-green-800)] hover:border-[var(--color-tea-green-400)] disabled:cursor-not-allowed disabled:border-[var(--color-tea-green-200)] disabled:text-[var(--color-tea-green-300)]"
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
